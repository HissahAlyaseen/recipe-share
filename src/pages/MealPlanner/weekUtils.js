// Small date helpers for the weekly meal planner (weeks start on Monday).

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// Monday 00:00 of the week that contains `date`.
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const daysSinceMonday = (d.getDay() + 6) % 7; // getDay(): Sunday = 0
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// The 7 dates of a week, Monday → Sunday.
export function weekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// "2026-10-12": used as the key to store meals for a specific date.
export function toKey(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

// "Mon"
export const shortWeekday = (date) => WEEKDAYS[date.getDay()].slice(0, 3);

// "Monday, 12 October"
export const longDate = (date) => `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

// "12–18 October 2026"  or  "28 September – 4 October 2026"
export function weekRange(weekStart) {
  const end = addDays(weekStart, 6);
  const year = end.getFullYear();
  if (weekStart.getMonth() === end.getMonth()) {
    return `${weekStart.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]} ${year}`;
  }
  return `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${year}`;
}

// "12–18 October" (no year), used in the full-week title
export const weekRangeShort = (weekStart) => weekRange(weekStart).replace(/ \d{4}$/, '');
