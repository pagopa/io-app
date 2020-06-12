import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { EligibilityCheck } from "../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { InstanceId } from "../../../../../definitions/bonus_vacanze/InstanceId";
import { BonusesAvailable } from "../../../../../definitions/content/BonusesAvailable";
import { BonusActivationProgressEnum } from "../reducers/bonusVacanzeActivation";
import { EligibilityRequestProgressEnum } from "../reducers/eligibility";

export const availableBonusesLoad = createAsyncAction(
  "BONUS_AVAILABLE_REQUEST",
  "BONUS_AVAILABLE_SUCCESS",
  "BONUS_AVAILABLE_FAILURE"
)<void, BonusesAvailable, Error>();

export type EligibilityCheckPayload = {
  status: EligibilityRequestProgressEnum;
  check?: EligibilityCheck;
};

export const checkBonusEligibility = createAsyncAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST",
  "BONUS_CHECK_ELIGIBILITY_SUCCESS",
  "BONUS_CHECK_ELIGIBILITY_FAILURE"
)<void, EligibilityCheckPayload, Error>();

export const cancelBonusEligibility = createStandardAction(
  "BONUS_ELIGIBILITY_CANCEL"
)<void>();

export const completeBonusEligibility = createStandardAction(
  "BONUS_ELIGIBILITY_COMPLETED"
)<void>();

export const eligibilityRequestId = createStandardAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST_ID"
)<InstanceId>();

export const loadBonusVacanzeFromId = createAsyncAction(
  "BONUS_LOAD_FROM_ID_REQUEST",
  "BONUSLOAD_FROM_ID_SUCCESS",
  "BONUSLOAD_FROM_ID_FAILURE"
)<string, BonusActivationWithQrCode, Error>();

export type BonusVacanzeActivationPayload = {
  status: BonusActivationProgressEnum;
  instanceId?: InstanceId;
  activation?: BonusActivationWithQrCode;
};

export const bonusVacanzeActivation = createAsyncAction(
  "BONUS_ACTIVATION_REQUEST",
  "BONUS_ACTIVATION_SUCCESS",
  "BONUS_ACTIVATION_FAILURE"
)<void, BonusVacanzeActivationPayload, Error>();

export type BonusActions =
  | ActionType<typeof availableBonusesLoad>
  | ActionType<typeof eligibilityRequestId>
  | ActionType<typeof bonusVacanzeActivation>
  | ActionType<typeof checkBonusEligibility>
  | ActionType<typeof loadBonusVacanzeFromId>
  | ActionType<typeof cancelBonusEligibility>;
