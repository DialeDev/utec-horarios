import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker - use Vite's worker bundling
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Day name mapping: abbreviated forms → canonical 3-letter forms
 */
const DAY_ABBREVIATIONS = {
  'Lu': 'Lu', 'Ma': 'Ma', 'Mi': 'Mie', 'Mie': 'Mie',
  'Ju': 'Ju', 'Vi': 'Vi', 'Sa': 'Sab', 'Sab': 'Sab', 'Do': 'Dom', 'Dom': 'Dom'
};

/**
 * Normalize day abbreviations: "Ma-Ju" → "Ma-Ju" (cada uno es un día explícito, no un rango)
 * "Mi-Ju" → "Mie-Ju" (normaliza alias pero no interpola días intermedios)
 */
function normalizeDays(daysStr) {
  if (!daysStr) return '';
  const trimmed = daysStr.trim();
  if (trimmed.includes('-')) {
    return trimmed.split('-')
      .map(token => DAY_ABBREVIATIONS[token] || token)
      .join('-');
  }
  return DAY_ABBREVIATIONS[trimmed] || trimmed;
}

/**
 * Known room fragment words that appear on separate lines from course data.
 * - PREFIXES: appear on a line ABOVE the course row (start of multi-word room)
 * - SUFFIXES: appear on a line BELOW the course row (end of multi-word room)
 */
const ROOM_PREFIXES = new Set(['EN', 'GG-']);
const ROOM_SUFFIXES = new Set(['LINEA', 'MAGNA']);

/**
 * Regex to match course codes like BAS2-I, FILO-H, FIS1-I, EPRO-AC, etc.
 */
const CODE_REGEX = /^[A-Z0-9]{2,}(?:-[A-Za-z0-9]{1,3})?$/;

/**
 * Regex to match time ranges like "06:30-08:00"
 */
const TIME_REGEX = /\b(\d{1,2}:\d{2}-\d{1,2}:\d{2})\b/;

/**
 * Maximum Y distance (in PDF units) for a line to be considered an adjacent
 * room fragment (prefix above or suffix below).
 */
const Y_THRESHOLD = 20;

/**
 * Extract text items grouped into lines by Y position proximity.
 * Returns an array of { y, text } sorted top-to-bottom.
 */
function extractLines(textContent) {
  const yGroups = new Map();
  for (const item of textContent.items) {
    const y = Math.round(item.transform[5] / 5) * 5;
    if (!yGroups.has(y)) yGroups.set(y, []);
    yGroups.get(y).push({ str: item.str, x: item.transform[4] });
  }

  const lines = [];
  for (const [y, items] of yGroups) {
    items.sort((a, b) => a.x - b.x);
    lines.push({
      y,
      text: items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim()
    });
  }

  lines.sort((a, b) => b.y - a.y);
  return lines;
}

/**
 * Parse course data from a line of text that contains a time pattern.
 * Returns null if the line doesn't contain valid course data.
 */
function parseCourseLine(text) {
  const timeMatch = text.match(TIME_REGEX);
  if (!timeMatch) return null;

  const timeStr = timeMatch[1];
  const timeIdx = timeMatch.index;
  const beforeText = text.slice(0, timeIdx).trim();
  const afterText = text.slice(timeIdx + timeStr.length).trim();

  const tokens = beforeText.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return null;

  // Last 3 tokens are: days, matricula, section (backwards)
  const days = tokens[tokens.length - 1];
  const matricula = tokens[tokens.length - 2];
  const section = tokens[tokens.length - 3];

  if (!/^\d+$/.test(section)) return null;

  // Find course code in the first few tokens
  let code = '';
  let nameStartIdx = 0;
  for (let j = 0; j < Math.min(tokens.length - 3, 5); j++) {
    const candidate = tokens[j];
    if (CODE_REGEX.test(candidate) && !/^\d+$/.test(candidate)) {
      code = candidate;
      nameStartIdx = j + 1;
      break;
    }
  }

  if (!code) return null;

  const nameTokens = tokens.slice(nameStartIdx, tokens.length - 3);
  if (nameTokens.length === 0) return null;

  return {
    code,
    name: nameTokens.join(' '),
    section,
    matricula,
    days,
    time: timeStr,
    roomMiddle: afterText
  };
}

/**
 * Reconstruct the full room string by combining fragments from adjacent lines.
 *
 * In the PDF, room values can span multiple lines:
 *   - PREFIX (above course line): "EN" or "GG-"
 *   - MIDDLE (on course line, after time): e.g., "LINEA", "AULA", "SB-508"
 *   - SUFFIX (below course line): "LINEA" or "MAGNA"
 */
function reconstructRoom(courseLineY, lines, index) {
  let prefix = '';
  let suffix = '';

  // Check line above for room prefix
  if (index > 0) {
    const above = lines[index - 1];
    const dist = above.y - courseLineY;
    if (dist > 0 && dist <= Y_THRESHOLD) {
      const text = above.text.trim();
      if (ROOM_PREFIXES.has(text)) {
        prefix = text;
      }
    }
  }

  // Check line below for room suffix
  if (index < lines.length - 1) {
    const below = lines[index + 1];
    const dist = courseLineY - below.y;
    if (dist > 0 && dist <= Y_THRESHOLD) {
      const text = below.text.trim();
      if (ROOM_SUFFIXES.has(text)) {
        suffix = text;
      }
    }
  }

  return [prefix, courseLineY.roomMiddle, suffix]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || 'EN LINEA';
}

/**
 * Parse a UTEC course schedule PDF.
 *
 * The PDF has a tabular layout with columns:
 *   CODE | NAME | SEC | MAT | DAYS | TIME | AULA
 *
 * Room values often span multiple lines due to long names:
 *   "EN" + "LINEA" = "EN LINEA"
 *   "GG-" + "AULA" + "MAGNA" = "GG- AULA MAGNA"
 *
 * @param {File} file - PDF file to parse
 * @returns {Promise<{courses: Array, warnings: Array}>}
 */
export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const courses = [];
  const seenCourses = new Map();
  const warnings = [];

  // Process each page INDEPENDENTLY — Y coordinates are page-relative
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    const lines = extractLines(textContent);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parsed = parseCourseLine(line.text);
      if (!parsed) continue;

      // Reconstruct room from adjacent lines within the SAME page
      const room = reconstructRoom(parsed, lines, i);
      const normalizedDays = normalizeDays(parsed.days);

      if (!seenCourses.has(parsed.code)) {
        const course = {
          id: crypto.randomUUID(),
          code: parsed.code,
          name: parsed.name,
          sections: []
        };
        seenCourses.set(parsed.code, course);
        courses.push(course);
      }

      seenCourses.get(parsed.code).sections.push({
        id: crypto.randomUUID(),
        number: parsed.section,
        days: normalizedDays,
        time: parsed.time,
        room,
        matricula: parsed.matricula
      });
    }
  }

  if (courses.length === 0) {
    warnings.push('No se encontraron materias en el PDF. Verifica que sea la hoja de asesorías de UTEC.');
  }

  return { courses, warnings };
}
