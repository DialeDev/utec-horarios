// Day parsing: "Lu-Vi" → ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

const DAY_MAP = {
  'Lu': 'Lunes', 'Ma': 'Martes', 'Mi': 'Miércoles', 'Mié': 'Miércoles',
  'Ju': 'Jueves', 'Vi': 'Viernes', 'Sa': 'Sábado', 'Sáb': 'Sábado',
  'Do': 'Domingo',
  'Mie': 'Miércoles', 'Sab': 'Sábado', 'Dom': 'Domingo'
};

const DAYS_ORDER = ['Lu', 'Ma', 'Mie', 'Ju', 'Vi', 'Sab', 'Dom'];

const DAY_ALIASES = {
  'Mi': 'Mie', 'Sa': 'Sab', 'Do': 'Dom'
};

export const parseDays = (dayString) => {
  if (!dayString) return [];
  const cleanStr = dayString.trim();
  const parts = cleanStr.split(/[\s,]+/);
  const resultDays = new Set();

  parts.forEach(part => {
    if (part.includes('-')) {
      const [rawStart, rawEnd] = part.split('-');
      const start = DAY_ALIASES[rawStart] || rawStart;
      const end = DAY_ALIASES[rawEnd] || rawEnd;
      const startIndex = DAYS_ORDER.indexOf(start);
      const endIndex = DAYS_ORDER.indexOf(end);
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        for (let i = startIndex; i <= endIndex; i++) {
          const dayKey = DAYS_ORDER[i];
          if (DAY_MAP[dayKey]) resultDays.add(DAY_MAP[dayKey]);
        }
      }
    } else {
      const rawKey = part.replace('.', '');
      const key = DAY_ALIASES[rawKey] || rawKey;
      if (DAY_MAP[key]) {
        resultDays.add(DAY_MAP[key]);
      }
    }
  });

  return Array.from(resultDays);
};
