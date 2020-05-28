import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BonusList } from "../../types/bonusList";
import { BonusVacanze } from "../../types/bonusVacanze";
import { EligibilityCheck, EligibilityId } from "../../types/eligibility";
import { EligibilityRequestProgressEnum } from "../reducers/bonusVacanze";

export const eligibilityRequestProgress = createStandardAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST_PROGRESS"
)<EligibilityRequestProgressEnum>();

export const availableBonusesLoad = createAsyncAction(
  "BONUS_AVAILABLE_REQUEST",
  "BONUS_AVAILABLE_SUCCESS",
  "BONUS_AVAILABLE_FAILURE"
)<void, BonusList, Error>();

export const checkBonusEligibility = createAsyncAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST",
  "BONUS_CHECK_ELIGIBILITY_SUCCESS",
  "BONUS_CHECK_ELIGIBILITY_FAILURE"
)<void, EligibilityCheck, Error>();

export const eligibilityRequestId = createStandardAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST_ID"
)<EligibilityId>();

export const loadBonusVacanzeFromId = createAsyncAction(
  "BONUS_LOAD_FROM_ID_REQUEST",
  "BONUSLOAD_FROM_ID_SUCCESS",
  "BONUSLOAD_FROM_ID_FAILURE"
)<string, BonusVacanze, Error>();

export type BonusActions =
  | ActionType<typeof availableBonusesLoad>
  | ActionType<typeof eligibilityRequestProgress>
  | ActionType<typeof eligibilityRequestId>
  | ActionType<typeof checkBonusEligibility>
  | ActionType<typeof loadBonusVacanzeFromId>;
