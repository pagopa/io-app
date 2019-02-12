/**
 * Action types and action creator related to the Onboarding.
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export const tosAccept = createAsyncAction(
  "TOS_ACCEPT_REQUEST",
  "TOS_ACCEPT_SUCCESS",
  "TOS_ACCEPT_FAILURE"
)<void, void, void>();

export const fingerprintAcknowledge = createAsyncAction(
  "FINGERPRINT_ACKNOWLEDGE_REQUEST",
  "FINGERPRINT_ACKNOWLEDGE_SUCCESS",
  "FINGERPRINT_ACKNOWLEDGE_FAILURE"
)<void, void, void>();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export type OnboardingActions = ActionType<
  typeof tosAccept | typeof fingerprintAcknowledge | typeof abortOnboarding
>;
