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

export const tosAccepted = createStandardAction("TOS_ACCEPTED")();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export const clearOnboarding = createStandardAction("CLEAR_ONBOARDING")();

type OnboardingActionTypes =
  | typeof tosAccepted
  | typeof fingerprintAcknowledge
  | typeof abortOnboarding
  | typeof clearOnboarding;

export type OnboardingActions = ActionType<OnboardingActionTypes>;
