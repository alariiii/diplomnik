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

// Эндпоинт 2: Потоковая генерация текста на основе утвержденного плана
app.post('/api/generate', optionalAuthenticateToken, apiLimiter, upload.none(), async (req, res) => {
  // Устанавливаем заголовки для Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let keepAliveInterval;

  try {
    const { topic, workType, outline: outlineStr, documentId } = req.body;
    
    if (!topic) {
      res.write(`data: ${JSON.stringify({ text: 'Ошибка: Тема работы не указана.\n' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    if (topic.length > 500) {
      res.write(`data: ${JSON.stringify({ text: 'Ошибка: Тема работы слишком длинная (максимум 500 символов).\n' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    if (!outlineStr) {
      res.write(`data: ${JSON.stringify({ text: 'Ошибка: План работы не был передан.\n' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const outline = JSON.parse(outlineStr);

    // 2. Форматируем JSON в красиво оформленный читаемый текст (Markdown)
    let formattedText = `# ОГЛАВЛЕНИЕ\n\n`;
    formattedText += `Введение\n`;
    
    if (outline.chapters && Array.isArray(outline.chapters)) {
      outline.chapters.forEach((chapter, index) => {
        formattedText += `${index + 1} ${chapter.title}\n`;
        if (chapter.subsections && Array.isArray(chapter.subsections)) {
          chapter.subsections.forEach((sub, subIndex) => {
            formattedText += `  ${index + 1}.${subIndex + 1} ${sub}\n`;
          });
        }
      });
    }
    
    formattedText += `\nЗаключение\n`;

    // 3. Сообщаем пользователю, что план принят в работу
    res.write(`data: ${JSON.stringify({ text: '✅ **План работы успешно утвержден!** Начинаем процесс написания...\n' })}\n\n`);
    let fullDocumentText = `Тема: ${outline.topic || topic}\n\n# ОГЛАВЛЕНИЕ\n\n`;

    // --- НОВЫЙ ШАГ: Генерация списка литературы ---
    res.write(`data: ${JSON.stringify({ text: '\n\n*Подбор научных источников (ожидайте, формируем базу из 30-40 достоверных материалов)...*\n\n' })}\n\n`);
    const referencesData = await generateReferences(topic, workType);
    const referencesArray = referencesData.references || [];
    const referencesText = referencesArray.join('\n');
    res.write(`data: ${JSON.stringify({ text: `*Успешно подобрано источников: ${referencesArray.length}*\n\n` })}\n\n`);

    // 4. Подготавливаем массив всех частей для полной генерации
    const partsToGenerate = [];
    partsToGenerate.push({ type: "introduction", title: "Введение", description: outline.introduction });
    
    // Проверяем статус оплаты документа в базе данных
    let isPaid = false; 
    if (documentId && documentId !== 'null') {
      const docRecord = await prisma.document.findUnique({ where: { id: documentId } });
      if (docRecord && docRecord.isPaid) {
        isPaid = true;
      }
    }

    if (outline.chapters && Array.isArray(outline.chapters) && outline.chapters.length > 0) {
      // Первая глава: разбиваем на атомарные подпункты (Демо-доступ)
      const ch1 = outline.chapters[0];
      if (ch1.subsections && Array.isArray(ch1.subsections)) {
        ch1.subsections.forEach((sub, idx) => {
          partsToGenerate.push({
            type: "subsection",
            title: `1.${idx + 1} ${sub}`,
            chapterTitle: `ГЛАВА 1. ${ch1.title.toUpperCase()}`,
            isFirstSubsection: idx === 0
          });
        });
      }
      
      if (isPaid) {
        // Остальные главы также разбиваем на подпункты
        for (let i = 1; i < outline.chapters.length; i++) {
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
    }

    res.write(`data: ${JSON.stringify({ text: '\n\n---\n**Начинаем пошаговую генерацию текста работы...**\n' })}\n\n`);

    // Запускаем ping каждые 10 секунд, чтобы соединение не оборвалось по таймауту
    keepAliveInterval = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 10000);

    // 5. Генерируем каждый АТОМАРНЫЙ кусок и стримим клиенту
    for (const part of partsToGenerate) {
      // Если это первый подраздел новой главы, сначала выводим Заголовок 1 уровня (Название главы)
      if (part.type === 'subsection' && part.isFirstSubsection) {
        res.write(`data: ${JSON.stringify({ text: `\n\n# ${part.chapterTitle}\n\n` })}\n\n`);
        fullDocumentText += `\n# ${part.chapterTitle}\n\n`;
      }

      // Определяем уровень заголовка: Введение/Заключение - # (1 уровень), Подразделы - ## (2/3 уровень)
      const headingPrefix = (part.type === 'introduction' || part.type === 'conclusion') ? '# ' : '## ';

      res.write(`data: ${JSON.stringify({ text: `\n\n${headingPrefix}${part.title}\n` })}\n\n`);
      res.write(`data: ${JSON.stringify({ text: `*Генерируется текст (ожидайте)...*\n\n` })}\n\n`);

      const chapterText = await generateChapterText(topic, outlineStr, part, referencesText);
      
      fullDocumentText += `\n${headingPrefix}${part.title}\n\n${chapterText}\n\n`;
      res.write(`data: ${JSON.stringify({ text: `✅ Фрагмент успешно написан.\n` })}\n\n`);
    }

    if (keepAliveInterval) clearInterval(keepAliveInterval);

    res.write(`data: ${JSON.stringify({ text: '\n\n---\n**Генерация завершена. Формируем Word-документ (ГОСТ)...**\n' })}\n\n`);

    // 6. Формируем docx документ и конвертируем в Base64
    const docxBuffer = await generateGostDocx(fullDocumentText);
    const base64Docx = docxBuffer.toString('base64');

    // Обновляем документ в БД после успешной генерации
    if (documentId && documentId !== 'null') {
      await prisma.document.update({
        where: { id: documentId },
        data: { 
          content: fullDocumentText, 
          status: isPaid ? "completed" : "preview" // Если не оплачено, ставим статус "Превью"
        }
      });
    }

    // 7. Отправляем специальное SSE сообщение с файлом для скачивания
    const safeFileName = (outline.topic || topic).substring(0, 30).replace(/[^a-zа-я0-9]/gi, '_');
    res.write(`data: ${JSON.stringify({ file: base64Docx, fileName: `${safeFileName}.docx` })}\n\n`);

    // Завершаем стрим
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    console.error('Ошибка в эндпоинте /api/generate:', error);
    res.write(`data: ${JSON.stringify({ text: '\n\n**Произошла ошибка при генерации.** Пожалуйста, попробуйте позже.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Эндпоинт для применения промокода (Тестовая оплата)
app.post('/api/apply-promo', authenticateToken, async (req, res) => {
  try {
    const { documentId, promoCode } = req.body;
    
    // Наш секретный промокод для 100% оплаты
    if (promoCode === 'ALARIII') {
      await prisma.document.update({
        where: { id: documentId },
        data: { isPaid: true }
      });
      return res.json({ success: true, message: 'Промокод успешно применен! Проект полностью оплачен.' });
    }
    
    return res.status(400).json({ error: 'Неверный или недействительный промокод.' });
  } catch (error) {
    console.error('Ошибка применения промокода:', error);
    res.status(500).json({ error: 'Ошибка сервера при проверке промокода.' });
  }
});

// Эндпоинт для создания платежа (Yandex Pay / ЮKassa)
app.post('/api/create-payment', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.body;
    
    // TODO: Здесь должна быть реальная интеграция с API Yandex Pay / YooKassa
    // Пример: const payment = await yooKassa.createPayment({ amount: { value: '1490.00', currency: 'RUB' }, ... });
    
    // Пока возвращаем ссылку-заглушку (после интеграции замените на payment.confirmation.confirmation_url)
    const mockPaymentUrl = "https://yoomoney.ru/checkout/payments/v2/contract?orderId=mock_order_id";
    
    res.json({ paymentUrl: mockPaymentUrl });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании платежа.' });
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

// --- Раздача статических файлов фронтенда ---
// Указываем Express отдавать статические файлы из папки сборки React
app.use(express.static(path.join(__dirname, 'dist')));

// Любой GET-запрос, который не подошел под API, отправляем на React (для работы React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Бэкенд сервер успешно запущен на http://localhost:${port}`);
});