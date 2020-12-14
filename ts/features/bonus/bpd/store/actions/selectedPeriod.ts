import { ActionType, createStandardAction } from "typesafe-actions";
import { BpdPeriodAmount } from "../reducers/details/periods";

/**
 * Request the period list
 */
export const bpdSelectPeriod = createStandardAction("BPD_SELECT_PERIOD")<
  BpdPeriodAmount
>();

export type BpdSelectPeriodAction = ActionType<typeof bpdSelectPeriod>;
