// Mapeo de días string a índices y nombres completos
const DAY_MAP = {
  'Lu': 'Lunes', 'Ma': 'Martes', 'Mie': 'Miércoles', 'Mié': 'Miércoles',
  'Ju': 'Jueves', 'Vi': 'Viernes', 'Sab': 'Sábado', 'Sáb': 'Sábado', 'Dom': 'Domingo'
};

const DAYS_ORDER = ['Lu', 'Ma', 'Mie', 'Ju', 'Vi', 'Sab', 'Dom'];

// Parsea combinaciones complejas: "Lu, Vi", "Lu-Mie, Vi", "Lu Vi"
export const parseDays = (dayString) => {
  if (!dayString) return [];
  
  // 1. Limpieza inicial y normalización de acentos básicos si es necesario
  const cleanStr = dayString.trim();
  
  // 2. Separar por comas (,) o espacios en blanco para obtener "bloques"
  // Ej: "Lu, Vi" -> ["Lu", "Vi"]
  // Ej: "Lu-Mie Vi" -> ["Lu-Mie", "Vi"]
  const parts = cleanStr.split(/[\s,]+/); 
  
  const resultDays = new Set(); // Usamos Set para evitar duplicados

  parts.forEach(part => {
    // Caso A: Es un Rango (ej: Lu-Vi)
    if (part.includes('-')) {
      const [start, end] = part.split('-');
      const startIndex = DAYS_ORDER.indexOf(start);
      // Validamos que el end exista, si no asumimos que es el mismo start (fallback)
      const endIndex = DAYS_ORDER.indexOf(end);
      
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        // Agregamos todos los días intermedios
        for (let i = startIndex; i <= endIndex; i++) {
          const dayKey = DAYS_ORDER[i];
          if (DAY_MAP[dayKey]) resultDays.add(DAY_MAP[dayKey]);
        }
      }
    } 
    // Caso B: Es un día individual (ej: Lu)
    else {
      // Intentamos matchear directo, o limpiando un poco
      const key = part.replace('.', ''); // Por si ponen "Lu."
      if (DAY_MAP[key]) {
        resultDays.add(DAY_MAP[key]);
      }
    }
  });

  return Array.from(resultDays);
};

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