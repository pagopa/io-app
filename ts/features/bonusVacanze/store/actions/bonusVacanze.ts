import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { EligibilityCheck } from "../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { InstanceId } from "../../../../../definitions/bonus_vacanze/InstanceId";
import { BonusesAvailable } from "../../types/bonusesAvailable";
import { BonusActivationProgressEnum } from "../reducers/bonusVacanzeActivation";
import { EligibilityRequestProgressEnum } from "../reducers/eligibility";

export const eligibilityRequestProgress = createStandardAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST_PROGRESS"
)<EligibilityRequestProgressEnum>();

export const availableBonusesLoad = createAsyncAction(
  "BONUS_AVAILABLE_REQUEST",
  "BONUS_AVAILABLE_SUCCESS",
  "BONUS_AVAILABLE_FAILURE"
)<void, BonusesAvailable, Error>();

export const checkBonusEligibility = createAsyncAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST",
  "BONUS_CHECK_ELIGIBILITY_SUCCESS",
  "BONUS_CHECK_ELIGIBILITY_FAILURE"
)<void, EligibilityCheck, Error>();

export const eligibilityRequestId = createStandardAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST_ID"
)<InstanceId>();

export const loadBonusVacanzeFromId = createAsyncAction(
  "BONUS_LOAD_FROM_ID_REQUEST",
  "BONUSLOAD_FROM_ID_SUCCESS",
  "BONUSLOAD_FROM_ID_FAILURE"
)<string, BonusActivationWithQrCode, Error>();

export const bonusActivationRequestProgress = createStandardAction(
  "BONUS_ACTIVATION_REQUEST_PROGRESS"
)<BonusActivationProgressEnum>();

export const startBonusActivation = createAsyncAction(
  "BONUS_ACTIVATION_REQUEST",
  "BONUS_ACTIVATION_SUCCESS",
  "BONUS_ACTIVATION_FAILURE"
)<void, InstanceId, Error>();

export type BonusActions =
  | ActionType<typeof availableBonusesLoad>
  | ActionType<typeof eligibilityRequestProgress>
  | ActionType<typeof eligibilityRequestId>
  | ActionType<typeof startBonusActivation>
  | ActionType<typeof checkBonusEligibility>
  | ActionType<typeof loadBonusVacanzeFromId>;
