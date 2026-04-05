import dotenv from 'dotenv';
dotenv.config();

const ARTEMOX_API_KEY = process.env.ARTEMOX_API_KEY || "sk-ArR7YP5SiI-2JZZvB1bWCQ"; // Ваш боевой ключ
const ARTEMOX_BASE_URL = "https://api.artemox.com/v1";

/**
 * Функция для генерации структуры (плана) дипломной или курсовой работы.
 * Обращается к Artemox API и возвращает распарсенный JSON.
 * 
 * @param {string} topic - Тема работы
 * @param {string} workType - Тип работы (например, ВКР, Курсовая)
 * @returns {Promise<Object>} - Структура работы в формате JSON
 */
export const generateOutline = async (topic, workType = 'ВКР') => {
  const systemPrompt = `Ты — опытный и строгий профессор ведущего университета. 
Твоя задача — составить подробный, логичный и академически грамотный план (структуру) для студенческой работы.

Требования к структуре:
1. Введение (тезисное описание актуальности, цели, задач).
2. От 3 до 5 основных глав. В каждой главе по 2-4 подпункта.
   - Главы нумеруются арабскими цифрами (1, 2).
   - Подпункты нумеруются двумя цифрами через точку (1.1, 1.2). В конце номера точка НЕ ставится (правильно: "1.1 Название").
3. Заключение (краткое описание выводов).

Ты ДОЛЖЕН вернуть ответ СТРОГО в формате валидного JSON, без форматирования Markdown (без \`\`\`json) и без какого-либо дополнительного текста.
Ожидаемая структура JSON:
{
  "topic": "Уточненное название темы",
  "introduction": "Описание того, что будет во введении",
  "chapters": [
    {
      "title": "Название главы",
      "subsections": ["Подпункт 1.1: краткое описание", "Подпункт 1.2: краткое описание", "Подпункт 1.3: краткое описание"]
    }
  ],
  "conclusion": "Краткое описание выводов"
}`;

  const userPrompt = `Составь академический план для работы типа "${workType}" на тему: "${topic}".`;

  try {
    const response = await fetch(`${ARTEMOX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARTEMOX_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview", // Используем разрешенную для вашего ключа модель
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Ошибка API Artemox: ${response.status} ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Пытаемся извлечь JSON с помощью регулярного выражения
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : '{}';
    
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Ошибка парсинга JSON от ИИ:", parseError, "Ответ:", content);
      // Возвращаем дефолтный план работы в случае ошибки парсинга
      return {
        topic: topic,
        introduction: "Введение (сгенерировано по умолчанию из-за ошибки структуры ответа).",
        chapters: [
          { title: "Глава 1", subsections: ["Вводный пункт", "Основной анализ"] }
        ],
        conclusion: "Заключение (по умолчанию)."
      };
    }
    
  } catch (error) {
    console.error("Ошибка при генерации плана через Artemox API:", error);
    throw error;
  }
};

/**
 * Функция для генерации текста конкретной части (Введение, Подраздел, Заключение).
 * Обращается к Artemox API и возвращает академический текст.
 * 
 * @param {string} topic - Тема работы
 * @param {string} outlineStr - Общий план работы в виде JSON строки
 * @param {Object} partObj - Объект конкретной части с типом и описанием
 * @param {string} referencesList - Сгенерированный ранее список литературы
 * @returns {Promise<string>} - Сгенерированный текст главы
 */
export const generateChapterText = async (topic, outlineStr, partObj, referencesList) => {
  let partTaskDescription = "";
  if (partObj.type === 'introduction') {
    partTaskDescription = `Твоя текущая задача: написать ВВЕДЕНИЕ. Описание того, что нужно раскрыть: ${partObj.description}`;
  } else if (partObj.type === 'conclusion') {
    partTaskDescription = `Твоя текущая задача: написать ЗАКЛЮЧЕНИЕ. Описание того, что нужно раскрыть: ${partObj.description}`;
  } else if (partObj.type === 'subsection') {
    partTaskDescription = `Твоя текущая задача: написать текст ТОЛЬКО для подраздела "${partObj.title}". Этот подраздел входит в состав главы "${partObj.chapterTitle}". Не пиши текст для других подразделов!`;
  }

  const systemPrompt = `Ты — строгий академический автор. Твоя задача — написать глубокий и развернутый текст ТОЛЬКО для одной конкретной части студенческой работы.
КРИТИЧЕСКИЕ ПРАВИЛА ГОСТ, которые ты ОБЯЗАН соблюдать:
1. ТИПОГРАФИКА: Используй «длинное тире» (—). Используй кавычки-елочки («»), а для вложенных — кавычки-лапочки ("").
2. ТАБЛИЦЫ И РИСУНКИ (если уместно добавить):
   - Рисунки: под рисунком по центру «Рисунок 1 – Название» (без точки).
   - Таблицы: СНАЧАЛА над таблицей пишется «Таблица 1 – Название» (без точки), затем САМА ТАБЛИЦА СТРОГО В ФОРМАТЕ MARKDOWN (с использованием символов | и ---). Заголовки столбцов с прописной буквы.
3. ЦИТИРОВАНИЕ: Вставляй ссылки на источники в квадратных скобках (например, [1, с. 36]). Опирайся на предоставленный список литературы.
4. ОБЪЕМ И ГЛУБИНА: Текст должен быть предельно подробным. Минимальный объем ЭТОГО ФРАГМЕНТА — 800-1200 слов. Раскрывай мысль максимально детально.
5. ФОРМАТ: Отвечай ТОЛЬКО сгенерированным текстом. НЕ ПИШИ в ответе сам заголовок подраздела или главы (я добавлю его сам). Разделяй текст на абзацы.`;

  const userPrompt = `Тема всей работы: "${topic}".
Общий план работы (для понимания общего контекста):
${outlineStr}

УТВЕРЖДЕННЫЙ СПИСОК ЛИТЕРАТУРЫ:
${referencesList || "Опирайся на общеизвестные научные факты."}

${partTaskDescription}`;

  try {
    const response = await fetch(`${ARTEMOX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARTEMOX_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview", // Заменено на стабильную и доступную для ключа модель
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка API Artemox при генерации главы: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Ошибка при генерации текста главы:", error);
    return "Не удалось сгенерировать текст для данного раздела из-за ошибки сервера.";
  }
};

/**
 * Функция модерации: проверяет, относится ли запрос на правку к оригинальной теме.
 * Защита от абьюза (когда пользователь оплатил один проект, а пытается сгенерировать другой).
 * 
 * @param {string} originalTopic - Исходная тема оплаченного проекта
 * @param {string} editPrompt - Запрос пользователя на доработку/правки
 * @returns {Promise<{isValid: boolean, reason: string}>}
 */
export const checkTopicDeviation = async (originalTopic, editPrompt) => {
  const systemPrompt = `Ты — строгий автоматический модератор образовательного сервиса. 
Пользователь оплатил генерацию работы на определенную тему и теперь запрашивает внесение правок.
Твоя задача — убедиться, что его запрос на доработку логически относится к оригинальной теме, и он не пытается схитрить, заставив тебя написать совершенно новую работу на другую тему под видом "доработки".

ОРИГИНАЛЬНАЯ ТЕМА ПРОЕКТА: "${originalTopic}"
ЗАПРОС ПОЛЬЗОВАТЕЛЯ НА ПРАВКИ: "${editPrompt}"

Ответь строго в формате JSON:
{
  "isValid": true/false,
  "reason": "Если false, укажи краткую причину (например: 'Запрос отклоняется от темы: вы просите написать про программирование, хотя оригинальная тема была про маркетинг.') Если true, оставь пустую строку."
}`;

  try {
    const response = await fetch(`${ARTEMOX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARTEMOX_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview", // Можно использовать более дешевую/быструю модель для валидации
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.1
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{"isValid": true, "reason": ""}');
  } catch (error) {
    console.error("Ошибка при проверке отклонения темы:", error);
    return { isValid: true, reason: "" }; // В случае сбоя API пропускаем запрос, чтобы не блокировать честных юзеров
  }
};

/**
 * Функция для генерации списка литературы.
 * 
 * @param {string} topic - Тема работы
 * @param {string} workType - Тип работы
 * @returns {Promise<{references: string[]}>}
 */
export const generateReferences = async (topic, workType) => {
  const systemPrompt = `Ты — строгий библиограф и профессор. 
Твоя задача — составить репрезентативный и научно достоверный список литературы (около 30-40 источников) для работы по заданной теме.
Включи актуальные монографии, научные статьи, учебные пособия и (если применимо) нормативно-правовые акты за последние 5-10 лет.
Оформление каждого источника должно быть строго по ГОСТ (Р 7.0.100-2018).

Ты ДОЛЖЕН вернуть ответ СТРОГО в формате валидного JSON, без форматирования Markdown и лишних слов:
{
  "references": [
    "1. Фамилия, И. О. Название... ",
    "2. Фамилия, И. О. Название... "
  ]
}`;

  const userPrompt = `Составь список литературы для работы типа "${workType}" на тему: "${topic}".`;

  try {
    const response = await fetch(`${ARTEMOX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARTEMOX_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-3.1-pro-preview", // Используем мощную модель для точного JSON
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : '{"references": []}';
    
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Ошибка парсинга JSON литературы:", parseError, "Ответ:", content);
      return { references: ["1. Источник по умолчанию (ошибка парсинга)."] };
    }
  } catch (error) {
    console.error("Ошибка при генерации литературы через API:", error);
    return { references: ["1. Источник не найден (ошибка сервера)."] };
  }
};