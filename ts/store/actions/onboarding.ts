/**
 * Action types and action creator related to the Onboarding.
 */

import {
  PIN_CREATE_REQUEST,
  PIN_CREATE_SUCCESS,
  TOS_ACCEPT_REQUEST,
  TOS_ACCEPT_SUCCESS
} from "./constants";

// Actions
export type TosAcceptRequest = Readonly<{
  type: typeof TOS_ACCEPT_REQUEST;
}>;

export type TosAcceptSuccess = Readonly<{
  type: typeof TOS_ACCEPT_SUCCESS;
}>;

export type PinCreateRequest = Readonly<{
  type: typeof PIN_CREATE_REQUEST;
  // The selected PIN
  payload: string;
}>;

export type PinCreateSuccess = Readonly<{
  type: typeof PIN_CREATE_SUCCESS;
}>;

export type OnboardingActions =
  | TosAcceptRequest
  | TosAcceptSuccess
  | PinCreateRequest
  | PinCreateSuccess;

// Creators
export const acceptTos = (): TosAcceptRequest => ({
  type: TOS_ACCEPT_REQUEST
});

export const createPin = (pin: string): PinCreateRequest => ({
  type: PIN_CREATE_REQUEST,
  payload: pin
});
