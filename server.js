import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { generateOutline, generateChapterText, checkTopicDeviation, generateReferences } from './artemoxApi.js';
import { generateGostDocx } from './docxGenerator.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Гарантируем наличие DATABASE_URL в памяти процесса до первого запроса Prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Настройка middleware
const allowedOrigins = process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins }));
app.use(cors()); // Разрешаем запросы с любых устройств в локальной сети
app.use(express.json());

// Хранилище активных задач генерации (для поллинга)
const activeGenerations = new Map();

// Настройка multer для обработки form-data (так как клиент передает файл и текстовые поля)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Настройка ограничения запросов (Rate Limiting)
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5, // Максимум 5 запросов с одного IP
  message: { error: 'Слишком много запросов с этого IP, пожалуйста, попробуйте через час.' }
});

// Middleware для проверки JWT токена
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный или просроченный токен' });
    req.user = user;
    next();
  });
};

// Middleware для опциональной проверки токена (гостевой доступ)
export const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token === 'null') {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    req.user = err ? null : user; // В случае ошибки токена продолжаем как гость
    next();
  });
};

// Базовый роут для проверки работы API
app.get('/', (req, res) => {
  res.send('Бэкенд API успешно работает! Перейдите на адрес фронтенда (обычно http://localhost:5173) для работы с сайтом.');
});

// Эндпоинт регистрации
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Заполните все поля' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Пользователь с таким email уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    res.status(201).json({ message: 'Регистрация успешна', userId: newUser.id });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Эндпоинт авторизации (логин)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Заполните все поля' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Неверный email или пароль' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '7d' }
    );
    
    res.json({ token, message: 'Успешный вход' });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
});

// Эндпоинт получения истории сгенерированных документов пользователя
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Ошибка при получении документов:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении документов' });
  }
});

// Эндпоинт 1: Генерация плана (структуры) работы
app.post('/api/generate-outline', optionalAuthenticateToken, apiLimiter, upload.none(), async (req, res) => {
  try {
    const { topic, workType } = req.body;
    if (!topic) return res.status(400).json({ error: 'Тема работы не указана' });

    const outline = await generateOutline(topic, workType);

    let documentId = null;
    if (req.user) {
      const newDocument = await prisma.document.create({
        data: { 
          topic, workType, userId: req.user.userId, 
          outline: JSON.stringify(outline) // Сохраняем план в БД
        }
      });
      documentId = newDocument.id;
    }

    res.json({ outline, documentId });
  } catch (error) {
    console.error('Ошибка при генерации плана:', error);
    res.status(500).json({ error: `Ошибка при составлении структуры: ${error.message}` });
  }
});

// Эндпоинт 2: Асинхронная генерация текста на основе утвержденного плана (Поллинг)
app.post('/api/generate', optionalAuthenticateToken, apiLimiter, upload.none(), async (req, res) => {
  try {
    const { topic, workType, outline: outlineStr, documentId } = req.body;
    
    if (!topic || topic.length > 500 || !outlineStr) {
      return res.status(400).json({ error: 'Некорректные входные данные (тема или план отсутствуют)' });
    }

    const outline = JSON.parse(outlineStr);
    
    // Создаем уникальный ID задачи
    const jobId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    // Сохраняем начальное состояние задачи в памяти
    activeGenerations.set(jobId, { status: 'generating', content: '', file: null, fileName: '' });
    
    // 1. МГНОВЕННЫЙ ОТВЕТ ФРОНТЕНДУ (чтобы избежать таймаутов на хостинге)
    res.json({ message: 'Генерация запущена', jobId });

    // 2. ФОНОВЫЙ ПРОЦЕСС ГЕНЕРАЦИИ
    (async () => {
      const task = activeGenerations.get(jobId);
      // Функция помощник для дозаписи текста
      const updateContent = (text) => { task.content += text; };

      try {
        updateContent('✅ **План работы успешно утвержден!** Начинаем процесс написания...\n');
        let fullDocumentText = `Тема: ${outline.topic || topic}\n\n# ОГЛАВЛЕНИЕ\n\n`;

        updateContent('\n\n*Подбор научных источников (ожидайте, формируем базу из 30-40 достоверных материалов)...*\n\n');
        const referencesData = await generateReferences(topic, workType);
        const referencesArray = referencesData.references || [];
        const referencesText = referencesArray.join('\n');
        updateContent(`*Успешно подобрано источников: ${referencesArray.length}*\n\n`);

        const partsToGenerate = [];
        partsToGenerate.push({ type: "introduction", title: "Введение", description: outline.introduction });
        
        if (outline.chapters && Array.isArray(outline.chapters) && outline.chapters.length > 0) {
          for (let i = 0; i < outline.chapters.length; i++) {
            const ch = outline.chapters[i];
            if (ch.subsections && Array.isArray(ch.subsections)) {
              ch.subsections.forEach((sub, idx) => {
                partsToGenerate.push({
                  type: "subsection",
                  title: `${i + 1}.${idx + 1} ${sub}`,
                  chapterTitle: `ГЛАВА ${i + 1}. ${ch.title.toUpperCase()}`,
                  isFirstSubsection: idx === 0
                });
              });
            }
          }
          partsToGenerate.push({ type: "conclusion", title: "Заключение", description: outline.conclusion });
        }

        updateContent('\n\n---\n**Начинаем пошаговую генерацию текста работы...**\n');

        for (const part of partsToGenerate) {
          if (part.type === 'subsection' && part.isFirstSubsection) {
            updateContent(`\n\n# ${part.chapterTitle}\n\n`);
            fullDocumentText += `\n# ${part.chapterTitle}\n\n`;
          }
          const headingPrefix = (part.type === 'introduction' || part.type === 'conclusion') ? '# ' : '## ';

          updateContent(`\n\n${headingPrefix}${part.title}\n`);
          updateContent(`*Генерируется текст (ожидайте)...*\n\n`);

          const chapterText = await generateChapterText(topic, outlineStr, part, referencesText);
          
          fullDocumentText += `\n${headingPrefix}${part.title}\n\n${chapterText}\n\n`;
          updateContent(`✅ Фрагмент успешно написан.\n`);
        }

        updateContent('\n\n---\n**Генерация завершена. Формируем Word-документ (ГОСТ)...**\n');

        const docxBuffer = await generateGostDocx(fullDocumentText);
        const base64Docx = docxBuffer.toString('base64');

        if (documentId && documentId !== 'null') {
          await prisma.document.update({
            where: { id: documentId },
            data: { content: fullDocumentText, status: "completed" }
          });
        }

        const safeFileName = (outline.topic || topic).substring(0, 30).replace(/[^a-zа-я0-9]/gi, '_');
        task.file = base64Docx;
        task.fileName = `${safeFileName}.docx`;
        task.status = 'completed'; // Фронтенд увидит этот статус при следующем опросе

      } catch (error) {
        console.error('Ошибка в фоновом процессе /api/generate:', error);
        task.content += '\n\n**Произошла ошибка при генерации.** Пожалуйста, попробуйте позже.';
        task.status = 'error';
      }
    })(); // Запуск IIFE в фоне

  } catch (error) {
    console.error('Ошибка запуска /api/generate:', error);
    res.status(500).json({ error: 'Ошибка сервера при запуске генерации' });
  }
});

// Эндпоинт для проверки статуса (Поллинг)
app.get('/api/generation-status/:jobId', optionalAuthenticateToken, (req, res) => {
  const task = activeGenerations.get(req.params.jobId);
  if (!task) {
    return res.status(404).json({ error: 'Задача генерации не найдена или устарела' });
  }
  
  res.json(task);

  // Очистка памяти: удаляем задачу через 5 минут после её завершения
  if ((task.status === 'completed' || task.status === 'error') && !task.deleteScheduled) {
    task.deleteScheduled = true;
    setTimeout(() => activeGenerations.delete(req.params.jobId), 5 * 60 * 1000);
  }
});

// Эндпоинт для внесения правок в уже существующий проект (с AI-защитой)
app.post('/api/edit-document', authenticateToken, apiLimiter, async (req, res) => {
  try {
    const { documentId, editPrompt } = req.body;
    
    // 1. Находим оригинальный документ пользователя
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document || document.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    // 2. ИИ ПРОВЕРКА НА ПОПЫТКУ СМЕНЫ ТЕМЫ
    const validation = await checkTopicDeviation(document.topic, editPrompt);
    
    if (!validation.isValid) {
      // Пользователь пытается схитрить! Блокируем запрос.
      return res.status(403).json({ 
        error: 'Попытка смены темы отклонена', 
        reason: validation.reason 
      });
    }

    // 3. Если проверка пройдена, генерируем правки...
    res.json({ message: 'Правки одобрены и приняты в работу!', status: 'processing' });
    // Здесь будет вызов генерации исправленного текста через Artemox API...

  } catch (error) {
    console.error('Ошибка при редактировании:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Эндпоинт для скачивания готового документа
app.get('/api/documents/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document || document.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    if (!document.content) {
      return res.status(400).json({ error: 'Документ еще не сгенерирован полностью' });
    }

    const docxBuffer = await generateGostDocx(document.content);
    const safeFileName = (document.topic || 'Проект').substring(0, 30).replace(/[^a-zа-я0-9]/gi, '_');

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}.docx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(docxBuffer);
  } catch (error) {
    console.error('Ошибка при скачивании:', error);
    res.status(500).json({ error: 'Ошибка сервера при формировании файла' });
  }
});

// --- Раздача статических файлов фронтенда ---

// Эндпоинты для SEO (robots.txt и sitemap.xml)
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://${req.get('host')}/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${req.get('host')}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// Указываем Express отдавать статические файлы из папки сборки React
app.use(express.static(path.join(__dirname, 'dist')));

// Любой GET-запрос, который не подошел под API, отправляем на React (для работы React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Бэкенд сервер успешно запущен на http://localhost:${port}`);
});