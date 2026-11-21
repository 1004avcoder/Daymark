/**
 * Format seconds into HH:MM:SS or MM:SS
 */
export function formatSeconds(totalSeconds: number, alwaysShowHours = false): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0 || alwaysShowHours) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format seconds into human readable Korean representation (e.g., 2시간 15분)
 */
export function formatDurationKorean(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s === 0) return '0분';
  
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (hours === 0 && minutes === 0 && seconds > 0) parts.push(`${seconds}초`);

  return parts.join(' ') || '0분';
}

/**
 * Format timestamp to Korean date string (2026.11.20 (목))
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayNames[date.getDay()];

  return `${year}.${month}.${day} (${dayOfWeek})`;
}

/**
 * Format timestamp to HH:mm (14:35)
 */
export function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convert Date or timestamp to 'YYYY-MM-DD' string
 */
export function getDateKey(dateInput?: Date | number): string {
  const date = dateInput ? (typeof dateInput === 'number' ? new Date(dateInput) : dateInput) : new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse 'YYYY-MM-DD' to Date object at local midnight
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Format dateKey to readable string (e.g., '11월 21일 (토)')
 */
export function formatDateKeyKorean(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
}

/**
 * Add or subtract days to a dateKey string
 */
export function addDays(dateKey: string, days: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return getDateKey(d);
}

/**
 * Check if dateKey is strictly before today
 */
export function isPastDate(dateKey: string): boolean {
  return dateKey < getDateKey();
}

/**
 * Check if dateKey is today
 */
export function isTodayDate(dateKey: string): boolean {
  return dateKey === getDateKey();
}

/**
 * Check if dateKey is strictly after today
 */
export function isFutureDate(dateKey: string): boolean {
  return dateKey > getDateKey();
}

/**
 * Get start and end timestamp of a specific dateKey
 */
export function getDayRangeForDateKey(dateKey: string): { start: number; end: number } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
  const end = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  return { start, end };
}

/**
 * Get start and end timestamp of today
 */
export function getTodayRange(): { start: number; end: number } {
  return getDayRangeForDateKey(getDateKey());
}

/**
 * Get start and end timestamp of the week (respecting weekStartDay: 0 = Sun, 1 = Mon)
 */
export function getWeekRange(weekStartDay: 0 | 1 = 1): { start: number; end: number } {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
  
  let diffDays = currentDay - weekStartDay;
  if (diffDays < 0) {
    diffDays += 7;
  }

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffDays, 0, 0, 0, 0).getTime();
  const end = new Date(start + 7 * 24 * 60 * 60 * 1000 - 1).getTime();

  return { start, end };
}
