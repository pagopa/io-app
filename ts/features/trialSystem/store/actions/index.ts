import { ActionType, createAsyncAction } from "typesafe-actions";
import { TrialId } from "../../../../../definitions/trial_systwem/TrialId";

export const trialSystemActivationUpsert = createAsyncAction(
  "TRIAL_SYSTEM_ACTIVATION_UPSERT_REQUEST",
  "TRIAL_SYSTEM_ACTIVATION_UPSERT_SUCCESS",
  "TRIAL_SYSTEM_ACTIVATION_UPSERT_FAILURE"
)<TrialId, boolean, Error>();

export const trialSystemActivationStatus = createAsyncAction(
  "TRIAL_SYSTEM_ACTIVATION_STATUS_REQUEST",
  "TRIAL_SYSTEM_ACTIVATION_STATUS_SUCCESS",
  "TRIAL_SYSTEM_ACTIVATION_STATUS_FAILURE"
)<TrialId, boolean, Error>();

export type TrialSystemActions =
  | ActionType<typeof trialSystemActivationUpsert>
  | ActionType<typeof trialSystemActivationStatus>;
