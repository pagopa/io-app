import { addMonths, isBefore } from "date-fns";

export const checkFourMonthPeriod = (date?: string) => {
  if (!date) {
    return true;
  }
  const currentDate = new Date();
  const logDate = new Date(date);
  const expirationDate = addMonths(logDate, 4);

  return !isNaN(logDate.getTime()) && isBefore(expirationDate, currentDate);
};
