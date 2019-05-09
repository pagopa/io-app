import { Wallet } from "../types/pagopa";

/* 
    Contains utility functions to check conditions
    used across project (currently just in CardComponent)
 */

export const isExpiredCard = (w: Wallet) => {
  const today: Date = new Date();
  const cmpM: number = today.getMonth() + 1;
  const cmpY: number = parseInt(
    today
      .getFullYear()
      .toString()
      .slice(2),
    10
  );
  return (
    parseInt(w.creditCard.expireMonth, 10) > cmpM &&
    parseInt(w.creditCard.expireYear, 10) <= cmpY
  );
};
