import { WithAwardPeriodId } from "./periods";

/**
 * The gained amount and transaction number related to a specific period
 * TODO: use this or the remote data?
 */
export type BpdAmount = WithAwardPeriodId & {
  // The total cashback amount gained by the user in the period (without super cashback)
  totalCashback: number;
  // The total transaction number in the period for the user
  transactionNumber: number;
};

export type BpdAmountError = WithAwardPeriodId & {
  error: Error;
};
