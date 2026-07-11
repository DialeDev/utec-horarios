import { jsPDF } from 'jspdf';
import { parseDays, parseTimeRange } from './time';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_START = 6 * 60;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (22 - 6) * 2;

const BRAND_COLOR = '#1a3c5e';

export function generatePDF(schedule) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;

  const gridLeft = margin + 15;
  const gridTop = 35;
  const gridWidth = pageWidth - margin * 2 - 15;
  const gridHeight = pageHeight - margin * 2 - 25;

  const dayWidth = gridWidth / 7;
  const slotHeight = gridHeight / TOTAL_SLOTS;

  // Header
  doc.setFontSize(18);
  doc.setTextColor('#1e293b');
  doc.text('Mi Horario Semanal', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  const date = new Date().toISOString().split('T')[0];
  doc.text(`Generado: ${date}`, pageWidth / 2, 22, { align: 'center' });

  // Grid background
  doc.setFillColor('#ffffff');
  doc.rect(gridLeft - 2, gridTop - 5, gridWidth + 4, gridHeight + 10, 'F');

  // Time labels
  doc.setFontSize(8);
  doc.setTextColor('#64748b');
  for (let i = 0; i <= 16; i++) {
    const y = gridTop + i * 2 * slotHeight;
    const hour = 6 + i;
    doc.text(`${hour.toString().padStart(2, '0')}:00`, margin + 2, y + 2);
  }

  // Day headers
  doc.setFontSize(10);
  doc.setTextColor('#1e293b');
  DAYS.forEach((day, idx) => {
    const x = gridLeft + idx * dayWidth;
    doc.setFillColor('#f1f5f9');
    doc.rect(x, gridTop - 5, dayWidth, 8, 'F');
    doc.text(day, x + dayWidth / 2, gridTop, { align: 'center' });
    doc.setDrawColor('#e2e8f0');
    doc.line(x, gridTop, x, gridTop + gridHeight);
  });

  // Horizontal grid lines
  for (let i = 0; i <= TOTAL_SLOTS; i++) {
    const y = gridTop + i * slotHeight;
    doc.setDrawColor('#e2e8f0');
    doc.line(gridLeft, y, gridLeft + gridWidth, y);
  }
  doc.line(gridLeft + gridWidth, gridTop, gridLeft + gridWidth, gridTop + gridHeight);

  // Schedule blocks
  schedule.forEach((item) => {
    const days = parseDays(item.days);
    const { start, end } = parseTimeRange(item.time);
    const startOffset = (start - TIME_START) / SLOT_MINUTES;
    const duration = (end - start) / SLOT_MINUTES;

    days.forEach((day) => {
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx === -1) return;

      const x = gridLeft + dayIdx * dayWidth + 1;
      const y = gridTop + startOffset * slotHeight + 1;
      const w = dayWidth - 2;
      const h = Math.max(duration * slotHeight - 2, 5);

      // Parse brand color
      const r = parseInt(BRAND_COLOR.slice(1, 3), 16);
      const g = parseInt(BRAND_COLOR.slice(3, 5), 16);
      const b = parseInt(BRAND_COLOR.slice(5, 7), 16);

      doc.setFillColor(r, g, b, 0.15);
      doc.setDrawColor(r, g, b);
      doc.roundedRect(x, y, w, h, 2, 2, 'FD');

      // Text
      doc.setFontSize(7);
      doc.setTextColor('#1e293b');
      const name = item.name.length > 15 ? item.name.substring(0, 14) + '...' : item.name;
      doc.text(name, x + 2, y + 4);

      doc.setFontSize(6);
      doc.setTextColor('#64748b');
      doc.text(item.time, x + 2, y + 7);

      if (item.room) {
        doc.text(item.room, x + 2, y + 10);
      }
    });
  });

  // Legend
  const legendY = pageHeight - 12;
  doc.setFontSize(8);
  doc.setTextColor('#1e293b');
  doc.text('Leyenda:', margin, legendY);

  doc.setFontSize(7);
  doc.text(`Total: ${schedule.length} secciones`, margin + 15, legendY);

  // Footer
  doc.setFontSize(6);
  doc.setTextColor('#94a3b8');
  doc.text('Built with Horarios Utec', pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc.output('blob');
}

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
