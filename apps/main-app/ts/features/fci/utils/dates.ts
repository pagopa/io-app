/**
 * Returns the number of days between two dates
 */
export const daysBetweenDate = (d1: Date, d2: Date) =>
  Math.round(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
