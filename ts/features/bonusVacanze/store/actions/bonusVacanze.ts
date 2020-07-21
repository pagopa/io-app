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

/**
 * Request the list of all the bonus activated
 */
export const loadAllBonusActivations = createAsyncAction(
  "BONUS_VACANZE_LOAD_ALL_ACTIVATION_REQUEST",
  "BONUS_VACANZE_LOAD_ALL_ACTIVATION_SUCCESS",
  "BONUS_VACANZE_LOAD_ALL_ACTIVATION_FAILURE"
)<void, void, Error>();

/**
 * Request the list of all the types of bonus
 */
export const loadAvailableBonuses = createAsyncAction(
  "BONUSES_AVAILABLE_REQUEST",
  "BONUSES_AVAILABLE_SUCCESS",
  "BONUSES_AVAILABLE_FAILURE"
)<void, BonusesAvailable, Error>();

export type EligibilityCheckPayload = {
  status: EligibilityRequestProgressEnum;
  check?: EligibilityCheck;
};
/**
 * Start and handle the eligibility phase
 */
export const checkBonusVacanzeEligibility = createAsyncAction(
  "BONUS_VACANZE_CHECK_ELIGIBILITY_REQUEST",
  "BONUS_VACANZE_CHECK_ELIGIBILITY_SUCCESS",
  "BONUS_VACANZE_CHECK_ELIGIBILITY_FAILURE"
)<void, EligibilityCheckPayload, Error>();

export const storeEligibilityRequestId = createStandardAction(
  "BONUS_VACANZE_CHECK_ELIGIBILITY_STORE_REQUEST_ID"
)<InstanceId>();

/**
 * Start and handle the activation phase
 */
export const activateBonusVacanze = createAsyncAction(
  "BONUS_VACANZE_ACTIVATION_REQUEST",
  "BONUS_VACANZE_ACTIVATION_SUCCESS",
  "BONUS_VACANZE_ACTIVATION_FAILURE"
)<void, BonusVacanzeActivationPayload, Error>();

// A common event to cancel the request bonus, used both for eligibility and activation
export const cancelBonusVacanzeRequest = createStandardAction(
  "BONUS_VACANZE_REQUEST_CANCEL"
)<void>();

export const showBonusVacanze = createStandardAction("BONUS_VACANZE_SHOW")<
  void
>();

// Complete the bonus activation phase with success
export const completeBonusVacanzeActivation = createStandardAction(
  "BONUS_VACANZE_ACTIVATION_COMPLETE"
)();

export const loadBonusVacanzeFromId = createAsyncAction(
  "BONUS_VACANZE_LOAD_FROM_ID_REQUEST",
  "BONUS_VACANZE_LOAD_FROM_ID_SUCCESS",
  "BONUS_VACANZE_LOAD_FROM_ID_FAILURE"
)<string, BonusActivationWithQrCode, { error: Error; id: string }>();

export const startLoadBonusFromIdPolling = createStandardAction(
  "BONUS_VACANZE_FROM_ID_POLLING_START"
)<string>();

export const cancelLoadBonusFromIdPolling = createStandardAction(
  "BONUS_VACANZE_FROM_ID_POLLING_CANCEL"
)<void>();

export type BonusVacanzeActivationPayload = {
  status: BonusActivationProgressEnum;
  instanceId?: InstanceId;
  activation?: BonusActivationWithQrCode;
};

export type BonusActions =
  | ActionType<typeof loadAvailableBonuses>
  | ActionType<typeof storeEligibilityRequestId>
  | ActionType<typeof activateBonusVacanze>
  | ActionType<typeof checkBonusVacanzeEligibility>
  | ActionType<typeof loadBonusVacanzeFromId>
  | ActionType<typeof loadAllBonusActivations>
  | ActionType<typeof startLoadBonusFromIdPolling>
  | ActionType<typeof cancelBonusVacanzeRequest>
  | ActionType<typeof completeBonusVacanzeActivation>
  | ActionType<typeof showBonusVacanze>
  | ActionType<typeof cancelLoadBonusFromIdPolling>;
