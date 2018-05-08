/**
 * Action types and action creator related to the Onboarding.
 */

import {
  PIN_LOGIN_VALIDATE_FAILURE,
  PIN_LOGIN_VALIDATE_REQUEST,
  PIN_LOGIN_VALIDATE_SUCCESS
} from "./constants";

// Actions

export type PinValidateSuccess = Readonly<{
  type: typeof PIN_LOGIN_VALIDATE_SUCCESS;
}>;
export type PinValidateFailure = Readonly<{
  type: typeof PIN_LOGIN_VALIDATE_FAILURE;
}>;
export type PinValidateRequest = Readonly<{
  type: typeof PIN_LOGIN_VALIDATE_REQUEST;
  payload: string;
}>;

export type PinloginActions =
  | PinValidateFailure
  | PinValidateRequest
  | PinValidateSuccess;

// Creators
// Send the PIN to be match with the one in the keychain
export const validatePin = (pin: string): PinValidateRequest => ({
  type: PIN_LOGIN_VALIDATE_REQUEST,
  payload: pin
});
