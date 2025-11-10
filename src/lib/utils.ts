/**
 * Get color for pain scale (1-10)
 * 1 -> Light green (mild)
 * 5 -> Yellow/orange (moderate)
 * 10 -> Red (severe)
 */
export function getPainColor(scale: number): string {
  if (scale < 1) return '#90EE90'; // Light green
  if (scale >= 10) return '#DC143C'; // Crimson red
  
  // Interpolate between colors
  if (scale <= 5) {
    // Green to Yellow (1-5)
    const ratio = (scale - 1) / 4;
    const r = Math.round(144 + (255 - 144) * ratio);
    const g = Math.round(238 + (215 - 238) * ratio);
    const b = Math.round(144 * (1 - ratio));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Red (5-10)
    const ratio = (scale - 5) / 5;
    const r = Math.round(255 - (255 - 220) * ratio * 0.2);
    const g = Math.round(215 * (1 - ratio));
    const b = Math.round(60 * (1 - ratio));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
