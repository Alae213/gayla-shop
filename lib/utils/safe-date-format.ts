/**
 * Safe Date Formatting for Safari
 * 
 * Safari (especially iOS) has issues with date-fns format() when:
 * - Date is invalid
 * - Timezone offset is unusual
 * - Date is very old (< 1900) or very far future (> 2100)
 * 
 * This utility provides fallbacks and graceful error handling.
 */

import { format, formatDistanceToNow } from "date-fns";

/**
 * Safely format a date using date-fns with Safari-compatible fallbacks
 * 
 * @param date - Date object, timestamp, or date string
 * @param formatStr - date-fns format string (e.g., "MMM d, yyyy")
 * @param fallback - What to return if formatting fails
 * @returns Formatted date string or fallback
 */
export function safeDateFormat(
  date: Date | number | string | null | undefined,
  formatStr: string = "MMM d, yyyy",
  fallback: string = "Invalid Date"
): string {
  try {
    // Handle null/undefined
    if (!date) return fallback;

    // Convert to Date object
    const dateObj = typeof date === "object" && date instanceof Date
      ? date
      : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("[safeDateFormat] Invalid date:", date);
      return fallback;
    }

    // Try date-fns format
    return format(dateObj, formatStr);
  } catch (error) {
    console.warn("[safeDateFormat] date-fns format failed:", error, date);
    
    // Fallback to native Intl.DateTimeFormat (more reliable on Safari)
    try {
      const dateObj = new Date(date!);
      if (isNaN(dateObj.getTime())) return fallback;
      
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateObj);
    } catch {
      return fallback;
    }
  }
}

/**
 * Safely format relative time (e.g., "2 hours ago")
 * 
 * @param date - Date object, timestamp, or date string
 * @param fallback - What to return if formatting fails
 * @returns Relative time string or fallback
 */
export function safeRelativeTime(
  date: Date | number | string | null | undefined,
  options?: { addSuffix?: boolean },
  fallback: string = "Unknown time"
): string {
  try {
    if (!date) return fallback;

    const dateObj = typeof date === "object" && date instanceof Date
      ? date
      : new Date(date);

    if (isNaN(dateObj.getTime())) return fallback;

    return formatDistanceToNow(dateObj, options);
  } catch (error) {
    console.warn("[safeRelativeTime] formatDistanceToNow failed:", error, date);
    return fallback;
  }
}

/**
 * Format a date with time in a Safari-safe way
 * 
 * @param date - Date object, timestamp, or date string
 * @returns Formatted date and time
 */
export function safeDateTimeFormat(
  date: Date | number | string | null | undefined,
  fallback: string = "Invalid Date"
): string {
  try {
    if (!date) return fallback;

    const dateObj = typeof date === "object" && date instanceof Date
      ? date
      : new Date(date);

    if (isNaN(dateObj.getTime())) return fallback;

    // Try date-fns first
    try {
      return format(dateObj, "MMM d, yyyy 'at' HH:mm");
    } catch {
      // Fallback to Intl
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    }
  } catch (error) {
    console.warn("[safeDateTimeFormat] Failed:", error, date);
    return fallback;
  }
}

/**
 * Check if a date is valid
 * Useful before passing to other date utilities
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Convert timestamp to Date safely
 * Convex returns timestamps as numbers, this ensures they're valid
 */
export function timestampToDate(timestamp: number | null | undefined): Date | null {
  if (!timestamp) return null;
  
  try {
    const date = new Date(timestamp);
    return isValidDate(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Common format patterns as constants
 */
export const DATE_FORMATS = {
  SHORT: "MMM d, yyyy",           // Dec 25, 2024
  LONG: "MMMM d, yyyy",           // December 25, 2024
  WITH_TIME: "MMM d, yyyy 'at' HH:mm", // Dec 25, 2024 at 14:30
  TIME_ONLY: "HH:mm",              // 14:30
  FULL: "EEEE, MMMM d, yyyy",     // Wednesday, December 25, 2024
  ISO: "yyyy-MM-dd",               // 2024-12-25
} as const;

/**
 * Example usage:
 * 
 * ```tsx
 * import { safeDateFormat, safeRelativeTime, DATE_FORMATS } from "@/lib/utils/safe-date-format";
 * 
 * // In component:
 * <time dateTime={date.toISOString()}>
 *   {safeDateFormat(date, DATE_FORMATS.WITH_TIME)}
 * </time>
 * 
 * <span>{safeRelativeTime(date, { addSuffix: true })}</span>
 * ```
 */
