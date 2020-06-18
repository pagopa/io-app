import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { EligibilityCheck } from "../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { InstanceId } from "../../../../../definitions/bonus_vacanze/InstanceId";
import { BonusesAvailable } from "../../../../../definitions/content/BonusesAvailable";
import { BonusActivationProgressEnum } from "../reducers/activation";
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

// A common event to cancel the request bonus, used both for eligibility and activation
export const cancelBonusRequest = createStandardAction("BONUS_REQUEST_CANCEL")<
  void
>();

export const eligibilityRequestId = createStandardAction(
  "BONUS_CHECK_ELIGIBILITY_REQUEST_ID"
)<InstanceId>();

export const loadBonusVacanzeFromId = createAsyncAction(
  "BONUS_LOAD_FROM_ID_REQUEST",
  "BONUS_LOAD_FROM_ID_SUCCESS",
  "BONUS_LOAD_FROM_ID_FAILURE"
)<string, BonusActivationWithQrCode, { error: Error; id: string }>();

export const startLoadBonusFromIdPolling = createStandardAction(
  "BONUS_FROM_ID_START"
)<string>();

export const loadAllBonusActivations = createAsyncAction(
  "BONUS_LOAD_ALL_ACTIVATION_REQUEST",
  "BONUS_LOAD_ALL_ACTIVATION_SUCCESS",
  "BONUS_LOAD_ALL_ACTIVATION_FAILURE"
)<void, void, Error>();

export const cancelLoadBonusFromIdPolling = createStandardAction(
  "BONUS_FROM_ID_CANCEL"
)<void>();

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

// TODO: remove with the true action
export const completeBonusVacanze = createStandardAction(
  "BONUS_ACTIVATION_COMPLETE"
)();

export type BonusActions =
  | ActionType<typeof availableBonusesLoad>
  | ActionType<typeof eligibilityRequestId>
  | ActionType<typeof bonusVacanzeActivation>
  | ActionType<typeof checkBonusEligibility>
  | ActionType<typeof loadBonusVacanzeFromId>
  | ActionType<typeof cancelBonusEligibility>
  | ActionType<typeof loadAllBonusActivations>
  | ActionType<typeof startLoadBonusFromIdPolling>
  | ActionType<typeof cancelBonusRequest>
  | ActionType<typeof cancelLoadBonusFromIdPolling>;
