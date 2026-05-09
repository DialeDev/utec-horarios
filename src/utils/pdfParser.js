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
  const courses = parseTableRows(fullText);

  if (courses.length === 0) {
    warnings.push('No se encontraron materias en el PDF. Verifica que sea la hoja de asesorías de UTEC.');
  }

  return { courses, warnings };
}

/**
 * Parse table rows from extracted text
 * @param {string} text - Full PDF text
 * @returns {Array} - Array of Course objects
 */
function parseTableRows(text) {
  const courses = [];
  
  // UTEC PDF pattern: Ciclo Código Materia Sección Días Hora Salon
  // Example: 2025-1 INF281 Estructura de Datos 1 Lu-Ju 07:00-09:00 LAB-203
  
  // Match course rows (Ciclo XX-X CODE NAME SECTION DAY TIME ROOM)
  const rowPattern = /(\d{4}[-]\d)\s+([A-Z]{3,4}\d{3})\s+([A-Za-zÀ-ÿ\s]+?)\s+(\d+)\s+([A-Za-zÀ-ÿ\-]+)\s+(\d{1,2}:\d{2}[-]\d{1,2}:\d{2})\s*([A-Z]*[-\d]*)?/g;
  
  let match;
  const seenCourses = new Map();
  
  while ((match = rowPattern.exec(text)) !== null) {
    const [, ciclo, code, name, section, days, time, room] = match;
    
    const courseCode = code.trim();
    const normalized = normalizeSection({ days, time, room: room || 'EN LINEA' });
    
    if (!seenCourses.has(courseCode)) {
      seenCourses.set(courseCode, {
        id: crypto.randomUUID(),
        code: courseCode,
        name: name.trim(),
        ciclo,
        sections: []
      });
    }
    
    const course = seenCourses.get(courseCode);
    course.sections.push({
      id: crypto.randomUUID(),
      number: section,
      ...normalized
    });
  }
  
  return Array.from(seenCourses.values());
}

/**
 * Normalize section data
 * @param {Object} row - Raw section data
 * @returns {Object} - Normalized section
 */
function normalizeSection(row) {
  const { days, time, room } = row;
  
  // Normalize days to abbreviations (Lu, Ma, etc.) to match parseDays expectations
  // Handle ranges like "Lu-Ju" or "Ma-Vi"
  let normalizedDays;
  if (days.includes('-')) {
    const [start, end] = days.split('-');
    const startIdx = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].indexOf(start);
    const endIdx = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].indexOf(end);
    const dayKeys = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
    normalizedDays = dayKeys.slice(startIdx, endIdx + 1).join('-');
  } else {
    normalizedDays = days;
  }
  
  // Normalize time (already in HH:MM-HH:MM format)
  const timeMatch = time.match(/(\d{1,2}):(\d{2})[-](\d{1,2}):(\d{2})/);
  let normalizedTime = time;
  if (timeMatch) {
    const [, startH, startM, endH, endM] = timeMatch;
    const start = parseInt(startH) * 60 + parseInt(startM);
    const end = parseInt(endH) * 60 + parseInt(endM);
    normalizedTime = `${startH.padStart(2, '0')}:${startM}-${endH.padStart(2, '0')}:${endM}`;
  }
  
  return {
    days: normalizedDays,
    time: normalizedTime,
    room: room.trim() || 'EN LINEA',
    matricula: ''
  };
}