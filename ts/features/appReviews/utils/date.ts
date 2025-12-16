import { addMonths, isPast } from "date-fns";

export const checkFourMonthPeriod = (date?: string) => {
  if (!date) {
    return true;
  }
  const logDate = new Date(date);
  const expirationDate = addMonths(logDate, 4);

  return !isNaN(logDate.getTime()) && isPast(expirationDate);
};
