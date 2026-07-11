import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker - use Vite's worker bundling
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Parse a UTEC course schedule PDF
 * @param {File} file - PDF file to parse
 * @returns {Promise<{courses: Array, warnings: Array}>}
 */
export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
  }

  const warnings = [];
  const courses = parseTableRows(fullText, warnings);

  if (courses.length === 0) {
    warnings.push('No se encontraron materias en el PDF. Verifica que sea la hoja de asesorías de UTEC.');
  }

  return { courses, warnings };
}

/**
 * Day name mapping: abbreviated forms → canonical 3-letter forms
 */
const DAY_ABBREVIATIONS = {
  'Lu': 'Lu', 'Ma': 'Ma', 'Mi': 'Mie', 'Mie': 'Mie',
  'Ju': 'Ju', 'Vi': 'Vi', 'Sa': 'Sab', 'Sab': 'Sab', 'Do': 'Dom', 'Dom': 'Dom'
};

const DAY_ORDER = ['Lu', 'Ma', 'Mie', 'Ju', 'Vi', 'Sab', 'Dom'];

/**
 * Parse day range strings like "Ma-Ju" or "Mie-Sab" into canonical form
 */
function normalizeDays(daysStr) {
  if (!daysStr) return '';
  const trimmed = daysStr.trim();
  if (trimmed.includes('-')) {
    const [start, end] = trimmed.split('-');
    const s = DAY_ABBREVIATIONS[start] || start;
    const e = DAY_ABBREVIATIONS[end] || end;
    const si = DAY_ORDER.indexOf(s);
    const ei = DAY_ORDER.indexOf(e);
    if (si !== -1 && ei !== -1 && si <= ei) {
      return DAY_ORDER.slice(si, ei + 1).join('-');
    }
  }
  // Try to normalize single day aliases
  return DAY_ABBREVIATIONS[trimmed] || trimmed;
}

/**
 * Parse table rows from extracted PDF text using time-anchored strategy
 * @param {string} text - Full PDF text
 * @param {string[]} warnings - Warning array to push into
 * @returns {Array} - Array of Course objects
 */
function parseTableRows(text, warnings) {
  const courses = [];
  const seenCourses = new Map();
  
  // Find all time anchors (HH:MM-HH:MM)
  const timePattern = /\b(\d{1,2}:\d{2}-\d{1,2}:\d{2})\b/g;
  const codePattern = /^[A-Z0-9]{2,}(?:-[A-Z0-9]{1,3})?$/;
  
  let timeMatch;
  let searchPos = 0;
  
  while ((timeMatch = timePattern.exec(text)) !== null) {
    const timeStr = timeMatch[1];
    const timeIdx = timeMatch.index;
    
    // Get text before time (about 150 chars back)
    const beforeStart = Math.max(0, timeIdx - 150);
    const beforeText = text.slice(beforeStart, timeIdx).trim();
    
    // Get text after time (about 50 chars forward)
    const afterEnd = Math.min(text.length, timeIdx + timeStr.length + 50);
    const afterText = text.slice(timeIdx + timeStr.length, afterEnd).trim();
    
    // Parse backwards from the end of beforeText
    // Expected structure: ... CODE    NAME    SECTION    MATRICULA    DAYS
    // Where DAYS immediately precedes the time
    
    // Split beforeText into tokens
    const tokens = beforeText.split(/\s+/).filter(t => t.length > 0);
    
    if (tokens.length < 4) continue;
    
    // The last token before time should be days (e.g., "Ma-Ju", "Lu-Vi", "Sab")
    const daysCandidate = tokens[tokens.length - 1];
    
    // The second-to-last should be matricula (single digit)
    const matriculaCandidate = tokens[tokens.length - 2];
    
    // The third-to-last should be section number
    const sectionCandidate = tokens[tokens.length - 3];
    
    // Everything before that is CODE + NAME (variable length)
    // Find the code: look for a pattern like AAA-NN or AAANNN at the start
    let code = '';
    let nameStartIdx = 0;
    
    for (let i = 0; i < Math.min(tokens.length - 3, 5); i++) {
      const candidate = tokens[i];
      if (/^[A-Z0-9]{2,}(?:-[A-Z0-9]{1,3})?$/.test(candidate) && !/^\d+$/.test(candidate)) {
        code = candidate;
        nameStartIdx = i + 1;
        break;
      }
    }
    
    if (!code) {
      warnings.push(`Fila ignorada: no se pudo identificar código de materia cerca de "${beforeText.slice(-60)}"`);
      continue;
    }
    
    // Everything between code and section is the course name
    const nameTokens = tokens.slice(nameStartIdx, tokens.length - 3);
    if (nameTokens.length === 0) {
      warnings.push(`Fila ignorada: sin nombre para materia ${code}`);
      continue;
    }
    const name = nameTokens.join(' ');
    const section = sectionCandidate;
    
    // Validate section is a number
    if (!/^\d+$/.test(section)) {
      continue;
    }
    
    // Parse room from afterText
    const room = afterText.replace(/\s+/g, ' ').trim() || 'EN LINEA';
    
    // Normalize days
    const formattedDays = normalizeDays(daysCandidate);
    
    // Create or update course
    if (!seenCourses.has(code)) {
      seenCourses.set(code, {
        id: crypto.randomUUID(),
        code,
        name,
        sections: []
      });
    }
    
    const course = seenCourses.get(code);
    course.sections.push({
      id: crypto.randomUUID(),
      number: section,
      days: formattedDays,
      time: timeStr,
      room,
      matricula: matriculaCandidate
    });
  }
  
  return Array.from(seenCourses.values());
}
