/**
 * This function converts the date (created_at) from string format to Date format
 */
export function convertStringToDate(date: string): Date {
  if (Date.parse(date) >= 0) {
    return new Date(date);
  } else {
    // If the string is invalid return the now date, to avoid print invalid date string
    return new Date();
  }
}
