export { parseDays } from './day';

// Convierte "06:30" a minutos totales (ej: 390)
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Verifica colisiones
export const checkTimeConflict = (range1, range2) => {
  return range1.start < range2.end && range1.end > range2.start;
};

// Parsea rango de horas
export const parseTimeRange = (timeString) => {
  const [startStr, endStr] = timeString.split('-');
  return {
    start: timeToMinutes(startStr),
    end: timeToMinutes(endStr),
    raw: timeString
  };
};