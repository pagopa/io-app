import { ActionType, createAsyncAction } from "typesafe-actions";
import { BonusesAvailable } from "../../../../../../definitions/content/BonusesAvailable";
import { BonusActivationCollection } from "../../../../../../definitions/bonus_vacanze/BonusActivationCollection";

/**
 * Request the list of all the types of bonus
 */
export const loadAvailableBonuses = createAsyncAction(
  "BONUSES_AVAILABLE_REQUEST",
  "BONUSES_AVAILABLE_SUCCESS",
  "BONUSES_AVAILABLE_FAILURE"
)<void, BonusesAvailable, Error>();

export const loadAllBonusActivations = createAsyncAction(
  "BONUS_VACANZE_LOAD_ALL_ACTIVATION_REQUEST",
  "BONUS_VACANZE_LOAD_ALL_ACTIVATION_SUCCESS",
  "BONUS_VACANZE_LOAD_ALL_ACTIVATION_FAILURE"
)<void, BonusActivationCollection["items"], Error>();

export type AvailableBonusesActions = ActionType<
  typeof loadAvailableBonuses | typeof loadAllBonusActivations
>;
