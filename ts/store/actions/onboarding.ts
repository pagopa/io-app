/**
 * Action types and action creator related to the Onboarding.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export const tosAcceptRequest = createStandardAction("TOS_ACCEPT_REQUEST")();

export const tosAcceptSuccess = createStandardAction("TOS_ACCEPT_SUCCESS")();

export const abortOnboarding = createStandardAction("ABORT_ONBOARDING")();

export type OnboardingActions = ActionType<
  typeof tosAcceptRequest | typeof tosAcceptSuccess | typeof abortOnboarding
>;
