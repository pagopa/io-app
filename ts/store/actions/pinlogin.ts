/**
 * Action types and action creator related to the Onboarding.
 */

import {
  PIN_FORGOT_REQUEST,
  PIN_FORGOT_SUCCESS,
  PIN_LOGIN_VALIDATE_FAILURE,
  PIN_LOGIN_VALIDATE_REQUEST,
  PIN_LOGIN_VALIDATE_SUCCESS
} from "./constants";

// Actions
export type PinForgotRequest = Readonly<{
  type: typeof PIN_FORGOT_REQUEST;
}>;

export type PinForgotSuccess = Readonly<{
  type: typeof PIN_FORGOT_SUCCESS;
}>;

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
  | PinForgotSuccess
  | PinForgotRequest
  | PinValidateFailure
  | PinValidateRequest
  | PinValidateSuccess;

// Creators
export const forgotPin = (): PinForgotRequest => ({
  type: PIN_FORGOT_REQUEST
});
// Send the PIN to be match with the one in the keychain
export const validatePin = (pin: string): PinValidateRequest => ({
  type: PIN_LOGIN_VALIDATE_REQUEST,
  payload: pin
});
