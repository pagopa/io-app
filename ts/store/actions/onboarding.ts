/**
 * Action types and action creator related to the Onboarding.
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export const fingerprintAcknowledge = createAsyncAction(
  "FINGERPRINT_ACKNOWLEDGE_REQUEST",
  "FINGERPRINT_ACKNOWLEDGE_SUCCESS",
  "FINGERPRINT_ACKNOWLEDGE_FAILURE"
)<void, void, void>();

export const tosAccepted = createStandardAction("TOS_ACCEPTED")<number>();

export const emailAcknowledged = createStandardAction("EMAIL_ACKNOWLEDGED")();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export const clearOnboarding = createStandardAction("CLEAR_ONBOARDING")();

export const emailInsert = createStandardAction("EMAIL_INSERT")();

export const servicesOptinCompleted = createStandardAction(
  "SERVICES_OPTIN_COMPLETED"
)();

export const completeOnboarding = createStandardAction("COMPLETE_ONBOARDING")();

type OnboardingActionTypes =
  | typeof tosAccepted
  | typeof fingerprintAcknowledge
  | typeof emailInsert
  | typeof emailAcknowledged
  | typeof abortOnboarding
  | typeof clearOnboarding
  | typeof servicesOptinCompleted
  | typeof completeOnboarding;

export type OnboardingActions = ActionType<OnboardingActionTypes>;
