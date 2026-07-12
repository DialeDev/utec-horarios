// Day parsing: "Ma-Ju" → ["Martes", "Jueves"] (cada uno es un día explícito, no un rango)

const DAY_MAP = {
  'Lu': 'Lunes', 'Ma': 'Martes', 'Mi': 'Miércoles', 'Mié': 'Miércoles',
  'Ju': 'Jueves', 'Vi': 'Viernes', 'Sa': 'Sábado', 'Sáb': 'Sábado',
  'Do': 'Domingo',
  'Mie': 'Miércoles', 'Sab': 'Sábado', 'Dom': 'Domingo'
};

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
      // "Ma-Ju" = Martes y Jueves (días específicos, NO es un rango continuo)
      const tokens = part.split('-');
      tokens.forEach(token => {
        const key = DAY_ALIASES[token] || token;
        if (DAY_MAP[key]) resultDays.add(DAY_MAP[key]);
      });
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
