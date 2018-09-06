/**
 * Action types and action creator related to the Onboarding.
 */

import { TOS_ACCEPT_REQUEST, TOS_ACCEPT_SUCCESS } from "./constants";

// Actions

export type TosAcceptRequest = Readonly<{
  type: typeof TOS_ACCEPT_REQUEST;
}>;

export type TosAcceptSuccess = Readonly<{
  type: typeof TOS_ACCEPT_SUCCESS;
}>;

export type OnboardingActions = TosAcceptRequest | TosAcceptSuccess;

// Creators

export const tosAcceptRequest: TosAcceptRequest = {
  type: TOS_ACCEPT_REQUEST
};

export const tosAcceptSuccess: TosAcceptSuccess = {
  type: TOS_ACCEPT_SUCCESS
};
