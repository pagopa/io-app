/** Action types and action creator related to the Onboarding. */

import { ActionType, createStandardAction } from "typesafe-actions";

export const fingerprintAcknowledged = createStandardAction(
  "FINGERPRINT_ACKNOWLEDGED"
)();

export const tosAccepted = createStandardAction("TOS_ACCEPTED")<number>();

export const emailAcknowledged = createStandardAction("EMAIL_ACKNOWLEDGED")();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export const servicesOptinCompleted = createStandardAction(
  "SERVICES_OPTIN_COMPLETED"
)();

export const completeOnboarding = createStandardAction("COMPLETE_ONBOARDING")();

export type OnboardingActions = ActionType<OnboardingActionTypes>;

type OnboardingActionTypes =
  | typeof abortOnboarding
  | typeof completeOnboarding
  | typeof emailAcknowledged
  | typeof fingerprintAcknowledged
  | typeof servicesOptinCompleted
  | typeof tosAccepted;
