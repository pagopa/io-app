export const getDateMsDifference = (firstDate: Date, secondDate: Date) =>
  Math.abs(firstDate.getTime() - secondDate.getTime());
