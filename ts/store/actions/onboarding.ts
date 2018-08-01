/**
 * Action types and action creator related to the Onboarding.
 */

import {
  START_ONBOARDING,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS
} from "./constants";

// Actions

export type StartOnboarding = Readonly<{
  type: typeof START_ONBOARDING;
}>;

export type TosAcceptRequest = Readonly<{
  type: typeof TOS_ACCEPT_REQUEST;
}>;

export type TosAcceptSuccess = Readonly<{
  type: typeof TOS_ACCEPT_SUCCESS;
}>;

export type OnboardingActions =
  | StartOnboarding
  | TosAcceptRequest
  | TosAcceptSuccess;

// Creators

export const startOnboarding = (): StartOnboarding => ({
  type: START_ONBOARDING
});

export const acceptTos = (): TosAcceptRequest => ({
  type: TOS_ACCEPT_REQUEST
});
