import { ActionType, createAsyncAction } from "typesafe-actions";
import { BonusList } from "../../types/bonusList";
import { EligibilityCheck } from "../../types/eligibility";

export const availableBonusesLoad = createAsyncAction(
  "BONUS_AVAILABLE_REQUEST",
  "BONUS_AVAILABLE_SUCCESS",
  "BONUS_AVAILABLE_FAILURE"
)<void, BonusList, Error>();

export const startBonusEligibility = createAsyncAction(
  "BONUS_START_ELIGIBILITY_REQUEST",
  "BONUS_START_ELIGIBILITY_SUCCESS",
  "BONUS_START_ELIGIBILITY_FAILURE"
)<void, EligibilityCheck, Error>();

export type BonusActions =
  | ActionType<typeof availableBonusesLoad>
  | ActionType<typeof startBonusEligibility>;
