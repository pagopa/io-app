import { ActionType, createStandardAction } from "typesafe-actions";
import { BpdPeriodWithAmount } from "../reducers/details/periods";

/**
 * Request the period list
 */
export const bpdSelectPeriod = createStandardAction("BPD_SELECT_PERIOD")<
  BpdPeriodWithAmount
>();

export type BpdSelectPeriodAction = ActionType<typeof bpdSelectPeriod>;
