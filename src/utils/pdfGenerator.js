import { jsPDF } from 'jspdf';
import { parseDays, parseTimeRange } from './time';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_START = 6 * 60;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (22 - 6) * 2; // 06:00 to 22:00 = 32 slots

const THEME_COLORS = {
  light: {
    bg: '#ffffff',
    grid: '#e2e8f0',
    header: '#f1f5f9',
    text: '#1e293b',
    textMuted: '#64748b',
  },
  dark: {
    bg: '#1e293b',
    grid: '#475569',
    header: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
  },
  colorful: {
    bg: '#fefce8',
    grid: '#e2e8f0',
    header: '#fef3c7',
    text: '#1f2937',
    textMuted: '#6b7280',
  }
};

/**
 * Convert hex color with alpha to jsPDF RGB format
 * @param {string} hex - Hex color like #2563eb
 * @param {number} alpha - Alpha value 0-1
 * @returns {Array} - [r, g, b] values 0-255
 */
function hexWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Generate a PDF from the schedule
 * @param {Array} schedule - Array of schedule items
 * @param {string} theme - 'light', 'dark', or 'colorful'
 * @param {string} color - Primary accent color
 * @param {Object} opts - Export options
 * @returns {Blob}
 */
export function generatePDF(schedule, theme = 'light', color = '#2563eb', opts = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  
  const themeColors = THEME_COLORS[theme] || THEME_COLORS.light;
  const primaryColor = color;

  // Calculate grid dimensions
  const gridLeft = margin + 15;
  const gridTop = 35;
  const gridWidth = pageWidth - margin * 2 - 15;
  const gridHeight = pageHeight - margin * 2 - 25;
  
  const dayWidth = gridWidth / 7;
  const slotHeight = gridHeight / TOTAL_SLOTS;

  // Draw header
  doc.setFontSize(18);
  doc.setTextColor(themeColors.text);
  doc.text('Mi Horario Semanal', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(themeColors.textMuted);
  const date = new Date().toISOString().split('T')[0];
  doc.text(`Generado: ${date}`, pageWidth / 2, 22, { align: 'center' });

  // Draw grid background
  doc.setFillColor(themeColors.bg);
  doc.rect(gridLeft - 2, gridTop - 5, gridWidth + 4, gridHeight + 10, 'F');

  // Draw time labels column
  doc.setFontSize(8);
  doc.setTextColor(themeColors.textMuted);
  for (let i = 0; i <= 16; i++) { // Every hour
    const y = gridTop + i * 2 * slotHeight;
    const hour = 6 + i;
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    doc.text(timeLabel, margin + 2, y + 2);
  }

  // Draw day headers and vertical lines
  doc.setFontSize(10);
  doc.setTextColor(themeColors.text);
  DAYS.forEach((day, idx) => {
    const x = gridLeft + idx * dayWidth;
    
    // Day header
    doc.setFillColor(themeColors.header);
    doc.rect(x, gridTop - 5, dayWidth, 8, 'F');
    doc.text(day, x + dayWidth / 2, gridTop, { align: 'center' });
    
    // Vertical line
    doc.setDrawColor(themeColors.grid);
    doc.line(x, gridTop, x, gridTop + gridHeight);
  });

  // Draw horizontal lines (every 30 min)
  for (let i = 0; i <= TOTAL_SLOTS; i++) {
    const y = gridTop + i * slotHeight;
    doc.setDrawColor(themeColors.grid);
    doc.line(gridLeft, y, gridLeft + gridWidth, y);
  }

  // Draw right border
  doc.line(gridLeft + gridWidth, gridTop, gridLeft + gridWidth, gridTop + gridHeight);

  // Draw schedule blocks
  schedule.forEach((item) => {
    const days = parseDays(item.days);
    const { start, end } = parseTimeRange(item.time);
    
    // Calculate position
    const startOffset = (start - TIME_START) / SLOT_MINUTES;
    const duration = (end - start) / SLOT_MINUTES;
    
    days.forEach((day) => {
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx === -1) return;
      
      const x = gridLeft + dayIdx * dayWidth + 1;
      const y = gridTop + startOffset * slotHeight + 1;
      const w = dayWidth - 2;
      const h = Math.max(duration * slotHeight - 2, 5);
      
      // Draw block
      const [r, g, b] = hexWithAlpha(primaryColor, 0.2);
      doc.setFillColor(r, g, b);
      doc.setDrawColor(...hexWithAlpha(primaryColor, 1));
      doc.roundedRect(x, y, w, h, 2, 2, 'FD');
      
      // Text content
      doc.setFontSize(7);
      doc.setTextColor(themeColors.text);
      
      // Truncate subject name if too long
      const name = item.subjectName.length > 15 ? item.subjectName.substring(0, 14) + '...' : item.subjectName;
      doc.text(name, x + 2, y + 4);
      
      // Time
      doc.setFontSize(6);
      doc.setTextColor(themeColors.textMuted);
      doc.text(item.time, x + 2, y + 7);
      
      // Room
      if (opts.showRoom !== false) {
        doc.text(item.room || '', x + 2, y + 10);
      }
    });
  });

  // Draw legend
  const legendY = pageHeight - 12;
  doc.setFontSize(8);
  doc.setTextColor(themeColors.text);
  doc.text('Leyenda:', margin, legendY);
  
  doc.setFontSize(7);
  doc.text(`Total: ${schedule.length} secciones`, margin + 15, legendY);

  // Add theme indicator
  if (theme !== 'light') {
    doc.text(`Tema: ${theme}`, margin + 45, legendY);
  }

  // Footer
  doc.setFontSize(6);
  doc.setTextColor(themeColors.textMuted);
  doc.text('Generado con UniScheduler UTEC', pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc.output('blob');
}

/**
 * Download the generated PDF
 * @param {Blob} blob 
 */
export function downloadPDF(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const date = new Date().toISOString().split('T')[0];
  link.download = `mi-horario-${date}.pdf`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}