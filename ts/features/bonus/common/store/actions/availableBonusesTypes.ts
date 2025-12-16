import { ActionType, createAsyncAction } from "typesafe-actions";
import { BonusesAvailable } from "../../../../../../definitions/content/BonusesAvailable";

/**
 * Request the list of all the types of bonus
 */
export const loadAvailableBonuses = createAsyncAction(
  "BONUSES_AVAILABLE_REQUEST",
  "BONUSES_AVAILABLE_SUCCESS",
  "BONUSES_AVAILABLE_FAILURE"
)<void, BonusesAvailable, Error>();

export type AvailableBonusesActions = ActionType<typeof loadAvailableBonuses>;
