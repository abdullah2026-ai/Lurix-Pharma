import { toZonedTime, format } from "date-fns-tz";

export const DHAKA_TIMEZONE = "Asia/Dhaka";

/**
 * Returns the current date in Asia/Dhaka timezone
 */
export function getDhakaNow(): Date {
  return toZonedTime(new Date(), DHAKA_TIMEZONE);
}

/**
 * Returns UTC Date objects for start and end of a given day in Asia/Dhaka
 * Defaults to today if no date provided.
 */
export function getDhakaDayRange(dateInput?: Date | string): { start: Date; end: Date } {
  const base = dateInput ? new Date(dateInput) : new Date();
  
  // Format the date string in Asia/Dhaka as YYYY-MM-DD
  const dateStr = format(toZonedTime(base, DHAKA_TIMEZONE), "yyyy-MM-dd", {
    timeZone: DHAKA_TIMEZONE,
  });

  // Dhaka midnight (00:00:00+06:00) converted to UTC
  const start = new Date(`${dateStr}T00:00:00.000+06:00`);
  const end = new Date(`${dateStr}T23:59:59.999+06:00`);

  return { start, end };
}

/**
 * Returns UTC Date objects for custom date range with Asia/Dhaka timezone
 */
export function getDhakaCustomRange(startDateStr: string, endDateStr: string): { start: Date; end: Date } {
  const start = new Date(`${startDateStr}T00:00:00.000+06:00`);
  const end = new Date(`${endDateStr}T23:59:59.999+06:00`);
  return { start, end };
}

/**
 * Formats a Date object or ISO string in Dhaka readable format
 */
export function formatDhakaDateTime(date: Date | string): string {
  try {
    const zoned = toZonedTime(new Date(date), DHAKA_TIMEZONE);
    return format(zoned, "dd MMM yyyy, hh:mm a", { timeZone: DHAKA_TIMEZONE });
  } catch {
    return "Invalid date";
  }
}

/**
 * Formats date only (dd MMM yyyy)
 */
export function formatDhakaDate(date: Date | string): string {
  try {
    const zoned = toZonedTime(new Date(date), DHAKA_TIMEZONE);
    return format(zoned, "dd MMM yyyy", { timeZone: DHAKA_TIMEZONE });
  } catch {
    return "Invalid date";
  }
}
