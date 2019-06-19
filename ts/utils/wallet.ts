import { CreditCard } from "../types/pagopa";

/* 
    Contains utility functions to check conditions
    used across project (currently just in CardComponent)
 */

export const isExpiredCard = (creditCard: CreditCard) => {
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
    parseInt(creditCard.expireYear, 10) < cmpY ||
    (parseInt(creditCard.expireYear, 10) === cmpY &&
      parseInt(creditCard.expireMonth, 10) < cmpM)
  );
};
