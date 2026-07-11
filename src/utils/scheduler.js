import { parseDays, parseTimeRange, checkTimeConflict } from './time';

/**
 * Check if a new schedule item conflicts with any existing items
 * @param {Object} newItem - { days: string, time: string }
 * @param {Array} schedule - Existing schedule items
 * @returns {{ conflict: boolean, with?: Object }}
 */
export function detectConflict(newItem, schedule) {
  const newDays = parseDays(newItem.days);
  const newTime = parseTimeRange(newItem.time);

  for (const existing of schedule) {
    const existingDays = parseDays(existing.days);
    const dayOverlap = newDays.some(d => existingDays.includes(d));
    if (!dayOverlap) continue;

    const existingTime = parseTimeRange(existing.time);
    if (checkTimeConflict(newTime, existingTime)) {
      return { conflict: true, with: existing };
    }
  }

  return { conflict: false };
}
