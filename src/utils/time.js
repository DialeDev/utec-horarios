// Mapeo de días string a índices y nombres completos
// Soporta tanto formas cortas (Mi, Sa, Do) como largas (Mie, Sab, Dom)
// para ser tolerante con la salida de pdfParser.js
const DAY_MAP = {
  // Formas cortas
  'Lu': 'Lunes', 'Ma': 'Martes', 'Mi': 'Miércoles', 'Mié': 'Miércoles',
  'Ju': 'Jueves', 'Vi': 'Viernes', 'Sa': 'Sábado', 'Sáb': 'Sábado',
  'Do': 'Domingo',
  // Formas largas
  'Mie': 'Miércoles', 'Sab': 'Sábado', 'Sáb': 'Sábado', 'Dom': 'Domingo'
};

// Orden canónico de días (largas para DAYS_ORDER, cortas para lookup)
const DAYS_ORDER = ['Lu', 'Ma', 'Mie', 'Ju', 'Vi', 'Sab', 'Dom'];

// Alias cortos para lookup en rangos — también acepta 'Mi', 'Sa', 'Do'
const DAY_ALIASES = {
  'Mi': 'Mie', 'Sa': 'Sab', 'Do': 'Dom'
};

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
      const [rawStart, rawEnd] = part.split('-');
      // Normalizar alias cortos (Mi->Mie, Sa->Sab, Do->Dom)
      const start = DAY_ALIASES[rawStart] || rawStart;
      const end = DAY_ALIASES[rawEnd] || rawEnd;
      const startIndex = DAYS_ORDER.indexOf(start);
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
      // Intentamos matchear directo, o normalizando alias cortos
      const rawKey = part.replace('.', '');
      const key = DAY_ALIASES[rawKey] || rawKey;
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