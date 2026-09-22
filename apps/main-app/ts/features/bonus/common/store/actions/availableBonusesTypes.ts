import { BonusesAvailable } from "@io-app/api-types/generated/definitions/content/BonusesAvailable";
import { ActionType, createAsyncAction } from "typesafe-actions";

/**
 * Request the list of all the types of bonus
 */
export const loadAvailableBonuses = createAsyncAction(
  "BONUSES_AVAILABLE_REQUEST",
  "BONUSES_AVAILABLE_SUCCESS",
  "BONUSES_AVAILABLE_FAILURE"
)<void, BonusesAvailable, Error>();

export type AvailableBonusesActions = ActionType<typeof loadAvailableBonuses>;
