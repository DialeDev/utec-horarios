/**
 * Generación de PDF para horarios UTEC.
 *
 * Sigue el patrón ReporteGenerator de app_gym:
 * - Objeto con métodos de generación
 * - Colores como arrays RGB numéricos (sin hex strings)
 * - Logo/avatar opcional con try/catch silencioso
 * - Naming consistente de archivos
 */

import { jsPDF } from 'jspdf';
import { parseDays, parseTimeRange } from './time';

// ── Constantes ──────────────────────────────────────────────

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_START = 6 * 60;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (22 - 6) * 2;

/**
 * Paleta de colores en arrays RGB numéricos.
 * Siguiendo el patrón de app_gym: valores hardcodeados, sin hex strings.
 */
const COLORS = {
  brand: [26, 60, 94],            // #1a3c5e — UTEC brand
  brandLight: [235, 243, 250],    // brand al ~10% de opacidad (precalculado, sin alpha)
  headerBg: [241, 245, 249],      // #f1f5f9
  headerText: [30, 41, 59],       // #1e293b
  gridBg: [250, 251, 252],        // #fafbfc
  gridLine: [226, 232, 240],      // #e2e8f0
  gridLineLight: [241, 245, 249], // #f1f5f9
  metaText: [100, 116, 139],      // #64748b
  footerLine: [226, 232, 240],    // #e2e8f0
};

// ── ReporteGenerator ────────────────────────────────────────

export const ReporteGenerator = {
  /**
   * Generar PDF del horario semanal en formato grilla visual.
   *
   * @param {Array}  schedule         — Lista de secciones seleccionadas
   * @param {string} [avatarBase64]   — Base64 del logo (opcional, esquina superior derecha)
   * @returns {Blob}                  — PDF blob listo para descargar
   */
  generarHorarioPDF(schedule, avatarBase64) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const W = 297;
    const H = 210;
    const margin = 10;

    // ── Geometría de la grilla ──
    const timeColWidth = 12;
    const gridLeft = margin + timeColWidth;
    const headerY = 30;           // fila de encabezados de días
    const gridTop = 40;           // la grilla empieza debajo del header
    const gridRight = W - margin;
    const gridBottom = H - margin - 8;
    const gridWidth = gridRight - gridLeft;
    const gridHeight = gridBottom - gridTop;

    const dayWidth = gridWidth / 7;
    const slotHeight = gridHeight / TOTAL_SLOTS;

    const [brandR, brandG, brandB] = COLORS.brand;

    // ── Logo / Avatar (patrón app_gym) ─────────────────
    if (avatarBase64) {
      try {
        doc.addImage(avatarBase64, 'PNG', 170, 10, 25, 25);
      } catch (_e) {
        // Silencioso si el base64 está corrupto o no es una imagen válida
      }
    }

    // ── Header ──────────────────────────────────────────
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.headerText);
    doc.text('Mi Horario Semanal', gridLeft, 15);

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.metaText);
    const date = new Date().toISOString().split('T')[0];
    doc.text(`Generado: ${date}`, gridLeft, 22);

    doc.text(`${schedule.length} secciones`, gridRight, 22, { align: 'right' });

    // ── Fondo de la grilla ──────────────────────────────
    doc.setFillColor(...COLORS.gridBg);
    doc.rect(gridLeft, gridTop, gridWidth, gridHeight, 'F');

    // ── Encabezados de días (fila separada del grid) ────
    DAYS.forEach((day, idx) => {
      const x = gridLeft + idx * dayWidth;

      doc.setFillColor(...COLORS.headerBg);
      doc.rect(x, headerY, dayWidth, 10, 'F');

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.headerText);
      doc.text(day, x + dayWidth / 2, headerY + 7, { align: 'center' });
    });

    // ── Líneas horarias y etiquetas ─────────────────────
    for (let i = 0; i <= 16; i++) {
      const y = gridTop + i * 2 * slotHeight;
      const hour = 6 + i;

      doc.setDrawColor(...COLORS.gridLine);
      doc.line(gridLeft, y, gridRight, y);

      doc.setFontSize(7);
      doc.setTextColor(...COLORS.metaText);
      doc.text(`${hour.toString().padStart(2, '0')}:00`, gridLeft - 2, y + 2, { align: 'right' });
    }

    // ── Líneas verticales (columnas de días) ────────────
    for (let i = 0; i <= 7; i++) {
      const x = gridLeft + i * dayWidth;
      doc.setDrawColor(...COLORS.gridLine);
      doc.line(x, gridTop, x, gridBottom);
    }

    // ── Marcadores de media hora ────────────────────────
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const y = gridTop + i * slotHeight;
      if (i % 2 === 1) {
        doc.setDrawColor(...COLORS.gridLineLight);
        doc.line(gridLeft, y, gridRight, y);
      }
    }

    // ── Helper: truncar texto al ancho disponible ──────
    const truncateToFit = (text, maxWidth) => {
      if (doc.getTextWidth(text) <= maxWidth) return text;
      let result = text;
      while (doc.getTextWidth(result + '…') > maxWidth && result.length > 0) {
        result = result.slice(0, -1);
      }
      return result + '…';
    };

    // ── Helper: partir nombre en dos líneas ────────────
    const splitName = (text, maxWidth) => {
      const words = text.split(' ');
      let line1 = '';
      let overflowed = false;
      const rest = [];
      for (const word of words) {
        if (overflowed) {
          rest.push(word);
          continue;
        }
        const testLine = line1 ? line1 + ' ' + word : word;
        if (doc.getTextWidth(testLine) <= maxWidth) {
          line1 = testLine;
        } else {
          overflowed = true;
          rest.push(word);
        }
      }
      return { line1, line2: rest.join(' ') };
    };

    // ── Bloques del horario (full cell, como /builder) ──
    schedule.forEach((item) => {
      const days = parseDays(item.days);
      const { start, end } = parseTimeRange(item.time);
      const startOffset = (start - TIME_START) / SLOT_MINUTES;
      const duration = (end - start) / SLOT_MINUTES;

      days.forEach((day) => {
        const dayIdx = DAYS.indexOf(day);
        if (dayIdx === -1) return;

        // El bloque ocupa casi todo el espacio de la celda (0.5mm gap c/u)
        const x = gridLeft + dayIdx * dayWidth + 0.5;
        const y = gridTop + startOffset * slotHeight + 0.5;
        const w = dayWidth - 1;
        const h = Math.max(duration * slotHeight - 1, 5);

        doc.setFillColor(...COLORS.brandLight);
        doc.setDrawColor(brandR, brandG, brandB);
        doc.roundedRect(x, y, w, h, 2, 2, 'FD');

        doc.setTextColor(brandR, brandG, brandB);

        // ── Contenido adaptativo al tamaño del bloque ──
        const roomText =
          !item.room || item.room.toUpperCase() === 'EN LINEA'
            ? 'En Línea'
            : item.room;

        const maxTextWidth = w - 3; // 1mm left + 2mm right safety

        if (h < 7) {
          // Bloques de ~30min: solo nombre (evita texto fuera del bloque)
          doc.setFontSize(7);
          doc.text(truncateToFit(item.name, maxTextWidth), x + 1, y + 3.5);

        } else if (h < 11) {
          // Bloques de ~1h: nombre + hora
          doc.setFontSize(7);
          doc.text(truncateToFit(item.name, maxTextWidth), x + 1, y + 3.5);

          doc.setFontSize(6);
          doc.text(item.time, x + 1, y + 7);

        } else {
          // Normal (1.5h+): nombre + hora + sección/salón (como /builder)
          const maxNameWidth = w - 2;

          // Si hay suficiente alto y el nombre no cabe, partirlo en dos líneas
          doc.setFontSize(7);
          if (h >= 16 && doc.getTextWidth(item.name) > maxNameWidth) {
            const { line1, line2 } = splitName(item.name, maxNameWidth);
            doc.text(line1, x + 1, y + 3.5);

            if (line2) {
              doc.text(line2, x + 1, y + 6.5);

              doc.setFontSize(6);
              doc.text(item.time, x + 1, y + 10);

              doc.setFontSize(5.5);
              doc.text(`Sec ${item.number}`, x + 1, y + h - 1.5);
              doc.text(roomText, x + w - 1, y + h - 1.5, { align: 'right' });
              return; // ya renderizamos todo
            }
          }

          // Una sola línea (truncada si es necesario)
          doc.text(truncateToFit(item.name, maxNameWidth), x + 1, y + 3.5);

          doc.setFontSize(6);
          doc.text(item.time, x + 1, y + 7);

          doc.setFontSize(5.5);
          doc.text(`Sec ${item.number}`, x + 1, y + h - 1.5);
          doc.text(roomText, x + w - 1, y + h - 1.5, { align: 'right' });
        }
      });
    });

    // ── Footer (patrón app_gym) ─────────────────────────
    doc.setDrawColor(...COLORS.footerLine);
    doc.line(gridLeft, gridBottom + 4, gridRight, gridBottom + 4);

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.metaText);
    doc.text('Horarios UTEC', gridRight, H - margin, { align: 'right' });

    return doc.output('blob');
  },
};

// ── Helper de descarga ──────────────────────────────────────

/**
 * Descargar un blob PDF en el navegador.
 * Sigue el naming consistente: horario_utec_YYYY-MM-DD.pdf
 *
 * @param {Blob} blob — PDF blob generado por ReporteGenerator
 */
export function downloadPDF(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.download = `horario_utec_${date}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
