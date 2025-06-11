/**
 * Date utility functions for the sobriety app
 * These functions provide consistent date calculations across the app
 */

/**
 * Calculate the number of days between two dates
 * @param startDate - The start date (Date object or ISO string)
 * @param endDate - The end date (Date object or ISO string), defaults to now
 * @returns Number of days between the dates (can be negative)
 */
export const calculateDaysDifference = (
  startDate: Date | string, 
  endDate: Date | string = new Date()
): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate days sober from a sobriety start date
 * @param startDate - The sobriety start date (Date object or ISO string)
 * @returns Number of days sober (minimum 0)
 */
export const calculateDaysSober = (startDate: Date | string): number => {
  return Math.max(0, calculateDaysDifference(startDate, new Date()));
};

/**
 * Format a date to YYYY-MM-DD string using UTC to avoid timezone issues
 * @param date - The date to format (Date object or ISO string), defaults to today
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date: Date | string = new Date()): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .split('T')[0];
};

/**
 * Format a date to ISO timestamp string
 * @param date - The date to format (Date object), defaults to now
 * @returns ISO timestamp string
 */
export const formatDateToISOString = (date: Date = new Date()): string => {
  return date.toISOString();
};

/**
 * Get today's date in YYYY-MM-DD format with proper UTC handling
 * @returns Today's date as YYYY-MM-DD string
 */
export const getTodayDateStr = (): string => {
  return formatDateToYYYYMMDD(new Date());
};

/**
 * Get the start of day (00:00:00) for a given date
 * @param date - The date to get start of day for, defaults to today
 * @returns Date object set to start of day
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Check if a date is today
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return checkDate.getDate() === today.getDate() &&
         checkDate.getMonth() === today.getMonth() &&
         checkDate.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is in the future
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate > new Date();
};

/**
 * Get a date N days ago from today
 * @param daysAgo - Number of days ago
 * @returns Date object for N days ago
 */
export const getDaysAgo = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

/**
 * Get a date string N days ago from today in YYYY-MM-DD format
 * @param daysAgo - Number of days ago
 * @returns Date string in YYYY-MM-DD format for N days ago
 */
export const getDaysAgoStr = (daysAgo: number): string => {
  return formatDateToYYYYMMDD(getDaysAgo(daysAgo));
};

/**
 * Constants for common time calculations
 */
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
} as const; 