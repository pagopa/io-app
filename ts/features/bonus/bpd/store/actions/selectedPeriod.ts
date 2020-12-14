import { ActionType, createStandardAction } from "typesafe-actions";
import { BpdPeriodAmount } from "../reducers/details/combiner";

/**
 * Request the period list
 */
export const bpdSelectPeriod = createStandardAction("BPD_SELECT_PERIOD")<
  BpdPeriodAmount
>();

export type BpdSelectPeriodAction = ActionType<typeof bpdSelectPeriod>;
