import { ActionType, createAsyncAction } from "typesafe-actions";
import { AwardPeriodId, WithAwardPeriodId } from "./periods";

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

/**
 * Request the Amount for a specific period
 */
export const bpdAmountLoad = createAsyncAction(
  "BPD_AMOUNT_REQUEST",
  "BPD_AMOUNT_SUCCESS",
  "BPD_AMOUNT_FAILURE"
)<AwardPeriodId, BpdAmount, BpdAmountError>();

export type BpdAmountAction = ActionType<typeof bpdAmountLoad>;
