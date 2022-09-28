import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { ActionType, createAsyncAction } from "typesafe-actions";
import { BpdPeriodWithInfo } from "../reducers/details/periods";

export type AwardPeriodId = number & IUnitTag<"AwardPeriodId">;

/**
 * The possible state for a period:
 * - Active: the current period, can be only one at time
 * - Closed: a past period that has ended
 * - Inactive: a future period not yet active
 */
export type BpdPeriodStatus = "Active" | "Inactive" | "Closed";

/**
 * This type contains all the information related to a specific cashback period.
 * TODO: use this or the remote data?
 */
export type BpdPeriod = WithAwardPeriodId & {
  startDate: Date;
  endDate: Date;
  status: BpdPeriodStatus;
  // minimum transaction number required to be eligible for the cashback
  minTransactionNumber: number;
  // maxAmount in the API, the max super cashback amount
  superCashbackAmount: number;
  // last valid position in the ranking to win the super cashback
  minPosition: number;
  // the max amount of cashback that can be accumulated for the single transaction
  maxTransactionCashback: number;
  // the max amount of cashback that can be accumulated in the period
  maxPeriodCashback: number;
  // the cashback % applied foreach transaction
  cashbackPercentage: number;
  // number of days required from the end of a period to consider the ranking confirmed
  gracePeriod: number;
};

export type WithAwardPeriodId = {
  awardPeriodId: AwardPeriodId;
};

/**
 * Request the period list & amount
 */
export const bpdPeriodsAmountLoad = createAsyncAction(
  "BPD_PERIODS_AMOUNT_REQUEST",
  "BPD_PERIODS_AMOUNT_SUCCESS",
  "BPD_PERIODS_AMOUNT_FAILURE"
)<void, ReadonlyArray<BpdPeriodWithInfo>, Error>();

export type BpdPeriodsAction = ActionType<typeof bpdPeriodsAmountLoad>;
