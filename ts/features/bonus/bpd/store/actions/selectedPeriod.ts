import { ActionType, createStandardAction } from "typesafe-actions";
import { BpdPeriod } from "./periods";

/**
 * Request the period list
 */
export const bpdSelectPeriod = createStandardAction("BPD_SELECT_PERIOD")<
  BpdPeriod
>();

export type BpdSelectPeriodAction = ActionType<typeof bpdSelectPeriod>;
