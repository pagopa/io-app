import { ActionType, createStandardAction } from "typesafe-actions";
import { BpdPeriodWithInfo } from "../reducers/details/periods";

/**
 * Request the period list
 */
export const bpdSelectPeriod =
  createStandardAction("BPD_SELECT_PERIOD")<BpdPeriodWithInfo>();

export type BpdSelectPeriodAction = ActionType<typeof bpdSelectPeriod>;
