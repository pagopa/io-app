import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { TrialId } from "../../../../../definitions/trial_system/TrialId";
import { Subscription } from "../../../../../definitions/trial_system/Subscription";

type ErrorPayload = {
  trialId: TrialId;
  error: Error;
};

export const trialSystemActivationStatusUpsert = createAsyncAction(
  "TRIAL_SYSTEM_ACTIVATION_UPSERT_REQUEST",
  "TRIAL_SYSTEM_ACTIVATION_UPSERT_SUCCESS",
  "TRIAL_SYSTEM_ACTIVATION_UPSERT_FAILURE"
)<TrialId, Subscription, ErrorPayload>();

export const trialSystemActivationStatus = createAsyncAction(
  "TRIAL_SYSTEM_ACTIVATION_STATUS_REQUEST",
  "TRIAL_SYSTEM_ACTIVATION_STATUS_SUCCESS",
  "TRIAL_SYSTEM_ACTIVATION_STATUS_FAILURE"
)<TrialId, Subscription, ErrorPayload>();

export const trialSystemActivationStatusReset = createStandardAction(
  "TRIAL_SYSTEM_ACTIVATION_STATUS_RESET"
)<TrialId>();

export type TrialSystemActions =
  | ActionType<typeof trialSystemActivationStatusUpsert>
  | ActionType<typeof trialSystemActivationStatusReset>
  | ActionType<typeof trialSystemActivationStatus>;
