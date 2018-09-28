/**
 * Action types and action creator related to the Onboarding.
 */

import {
  RESET_ONBOARDING,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS
} from "./constants";

// Actions

type TosAcceptRequest = Readonly<{
  type: typeof TOS_ACCEPT_REQUEST;
}>;

type TosAcceptSuccess = Readonly<{
  type: typeof TOS_ACCEPT_SUCCESS;
}>;

interface ResetOnboarding {
  type: typeof RESET_ONBOARDING;
}

export type OnboardingActions =
  | TosAcceptRequest
  | TosAcceptSuccess
  | ResetOnboarding;

// Creators

export const tosAcceptRequest: TosAcceptRequest = {
  type: TOS_ACCEPT_REQUEST
};

export const tosAcceptSuccess: TosAcceptSuccess = {
  type: TOS_ACCEPT_SUCCESS
};

export const resetOnboarding = (): ResetOnboarding => ({
  type: RESET_ONBOARDING
});
