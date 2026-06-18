/**
 * Action types and action creator related to the Onboarding.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export const fingerprintAcknowledged = createStandardAction(
  "FINGERPRINT_ACKNOWLEDGED"
)();

export const tosAccepted = createStandardAction("TOS_ACCEPTED")<number>();

export const emailAcknowledged = createStandardAction("EMAIL_ACKNOWLEDGED")();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export const emailInsert = createStandardAction("EMAIL_INSERT")();

export const servicesOptinCompleted = createStandardAction(
  "SERVICES_OPTIN_COMPLETED"
)();

export const completeOnboarding = createStandardAction("COMPLETE_ONBOARDING")();

type OnboardingActionTypes =
  | typeof tosAccepted
  | typeof fingerprintAcknowledged
  | typeof emailInsert
  | typeof emailAcknowledged
  | typeof abortOnboarding
  | typeof servicesOptinCompleted
  | typeof completeOnboarding;

export type OnboardingActions = ActionType<OnboardingActionTypes>;
