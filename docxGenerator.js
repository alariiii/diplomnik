import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TableOfContents, Table, TableRow, TableCell, WidthType } from "docx";
import * as fs from "fs";

/**
 * Функция для генерации Word-документа (.docx) с форматированием по ГОСТ.
 * 
 * @param {string} text - Сгенерированный текст работы (с переносами строк \n)
 * @param {string|null} outputPath - Путь для сохранения (опционально). Если null, файл не сохраняется на диск.
 * @returns {Promise<Buffer>} - Возвращает буфер файла (для отправки клиенту)
 */
export const generateGostDocx = async (text, outputPath = null) => {
  // Базовая автозамена типографики по ГОСТ (тире и кавычки)
  let processedText = text
    .replace(/\s-\s/g, ' — ') // Короткое тире между словами меняем на длинное
    .replace(/"([^"]*)"/g, '«$1»'); // Прямые кавычки в елочки

  // Разбиваем переданный текст на абзацы
  const lines = processedText.split("\n").filter((p) => p.trim() !== "");

  const docxElements = [];
  let tableRowsData = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. ПАРСЕР ТАБЛИЦ MARKDOWN
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Игнорируем разделительные строки Markdown вида |---|:---|
      const isSeparator = line.split('|').slice(1, -1).every(cell => /^[\s:*-]+$/.test(cell));
      if (isSeparator) continue;

      const cells = line.trim().split('|').slice(1, -1).map(c => c.trim());
      
      const tableCells = cells.map(cellText => {
        const isBold = cellText.startsWith('**') && cellText.endsWith('**');
        const cleanText = isBold ? cellText.slice(2, -2) : cellText.replace(/\*\*/g, '');
        
        return new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: cleanText, font: "Times New Roman", size: 24, color: "000000", bold: isBold })],
              alignment: AlignmentType.CENTER
            })
          ],
          verticalAlign: "center",
          margins: { top: 100, bottom: 100, left: 100, right: 100 }
        });
      });

      tableRowsData.push(new TableRow({ children: tableCells }));
      continue; // Переходим к следующей строке, так как мы внутри таблицы
    } else if (tableRowsData.length > 0) {
      // Если мы собирали таблицу, а теперь пошел обычный текст - закрываем таблицу
      docxElements.push(new Table({
        rows: tableRowsData,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }));
      tableRowsData = []; // Сбрасываем кэш строк
    }

    // 2. Обработка заголовков (начинаются с #, ##, ### и т.д.)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    
    if (headingMatch) {
      const level = headingMatch[1].length;
      let headingText = headingMatch[2].replace(/\.$/, ""); // Убираем точку в конце заголовка
      
      if (level === 1) {
        // Заголовки 1 уровня: по центру, ЗАГЛАВНЫМИ, с новой страницы
        headingText = headingText.toUpperCase();
        const isMajorSection = /^(ВВЕДЕНИЕ|ГЛАВА|ЗАКЛЮЧЕНИЕ|СПИСОК ЛИТЕРАТУРЫ|ОГЛАВЛЕНИЕ)/i.test(headingText);

        const headingPara = new Paragraph({
          children: [
            new TextRun({ text: headingText, font: "Times New Roman", size: 24, color: "000000", bold: true }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          pageBreakBefore: isMajorSection,
          spacing: { before: 240, after: 240 },
        });

        if (headingText === "ОГЛАВЛЕНИЕ" || headingText === "ОГЛАВЛЕНИЕ_АВТО") {
          const toc = new TableOfContents("Оглавление", {
            hyperlink: true,
            headingStyleRange: "1-3",
          });
          docxElements.push(headingPara, toc);
        } else {
          docxElements.push(headingPara);
        }
      } else {
        // Заголовки 2 и 3 уровня: слева, с отступом, двойной интервал перед
        docxElements.push(new Paragraph({
          children: [
            new TextRun({ text: headingText, font: "Times New Roman", size: 24, color: "000000", bold: true }),
          ],
          heading: level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          alignment: AlignmentType.LEFT,
          indent: { firstLine: 709 }, // 1,25 см
          spacing: { before: 480, after: 240 }, // 480 = двойной интервал (240*2)
        }));
      }
      continue;
    }

    // Проверка на рисунки и таблицы по ГОСТ
    const isFigure = /^Рисунок\s+\d+\s*[–-]\s*.+/.test(line.replace(/\*/g, ""));
    const isTable = /^Таблица\s+\d+\s*[–-]\s*.+/.test(line.replace(/\*/g, ""));

    // 2. Обработка обычного текста с поддержкой жирного шрифта (**текст**)
    const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    
    const textRuns = parts.map((part) => {
      const isBold = part.startsWith("**") && part.endsWith("**");
      // Убираем маркеры жирности и подчищаем возможные одиночные звездочки (курсив)
      const cleanText = isBold ? part.slice(2, -2) : part.replace(/\*/g, "");

      return new TextRun({
        text: cleanText,
        font: "Times New Roman",
        size: 24, // Кегль 12 (12 * 2 = 24 полупункта)
        color: "000000",
        bold: isBold,
      });
    });

    // Применяем выравнивание для спец. элементов
    let alignment = AlignmentType.JUSTIFIED;
    let indent = { firstLine: 709 }; // 1.25 см

    if (isFigure) {
      alignment = AlignmentType.CENTER;
      indent = { firstLine: 0 };
    } else if (isTable) {
      alignment = AlignmentType.RIGHT;
      indent = { firstLine: 0 };
    }

    docxElements.push(new Paragraph({
      children: textRuns,
      alignment: alignment,
      indent: indent,
      spacing: {
        line: 360, // Межстрочный интервал 1.5 (240 - одинарный, 240 * 1.5 = 360)
      },
    }));
  }

  // Если таблица была в самом конце документа - сохраняем ее
  if (tableRowsData.length > 0) {
    docxElements.push(new Table({
      rows: tableRowsData,
      width: { size: 100, type: WidthType.PERCENTAGE }
    }));
  }

  // Создаем структуру документа
  const doc = new Document({
    creator: "ДипломGPT",
    title: "Академическая работа",
    description: "Сгенерировано алгоритмом, оформление по ГОСТ",
    features: {
      updateFields: true, // Автоматическое обновление Оглавления при открытии
    },
    styles: {
      paragraphStyles: [
        {
          id: "TOC1",
          name: "toc 1",
          basedOn: "Normal",
          next: "Normal",
          run: { font: "Times New Roman", size: 24, color: "000000" },
          paragraph: { spacing: { after: 120 } },
        },
        {
          id: "TOC2",
          name: "toc 2",
          basedOn: "Normal",
          next: "Normal",
          run: { font: "Times New Roman", size: 24, color: "000000" },
          paragraph: { indent: { left: 360 }, spacing: { after: 120 } },
        },
        {
          id: "TOC3",
          name: "toc 3",
          basedOn: "Normal",
          next: "Normal",
          run: { font: "Times New Roman", size: 24, color: "000000" },
          paragraph: { indent: { left: 720 }, spacing: { after: 120 } },
        }
      ]
    },
    sections: [
      {
        properties: {},
        children: docxElements,
      },
    ],
  });

  // Упаковываем документ в Buffer
  const buffer = await Packer.toBuffer(doc);
  
  // Сохраняем на диск только если указан путь
  if (outputPath) fs.writeFileSync(outputPath, buffer);
  
  return buffer;
};