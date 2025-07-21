// dateUtils.ts - Utility functions for date operations

/**
 * Calculates the ISO week number for a given date
 * @param date - The date to calculate the week number for
 * @returns The ISO week number (1-53)
 */
export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Gets the Monday of the week for a given date and week offset
 * @param date - The reference date
 * @param weekOffset - Number of weeks to offset (positive or negative)
 * @returns Date object representing Monday of the calculated week
 */
export const getMondayOfWeek = (date: Date, weekOffset: number = 0): Date => {
  const result = new Date(date);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff + (weekOffset * 7));
  return result;
};

/**
 * Checks if a date is today
 * @param dateString - ISO date string to check
 * @returns True if the date is today, false otherwise
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  return dateString === todayString;
};

/**
 * Formats a date as an ISO date string (YYYY-MM-DD)
 * @param date - The date to format
 * @returns ISO date string
 */
export const formatISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};