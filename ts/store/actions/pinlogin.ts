/**
 * Action types and action creator related to the PinLogin.
 */

import { PinString } from "../../types/PinString";

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
  payload: PinString;
}>;

export type PinloginActions =
  | PinValidateFailure
  | PinValidateRequest
  | PinValidateSuccess;

// Send the PIN to be match with the one in the keychain
export const validatePin = (pin: PinString): PinValidateRequest => ({
  type: PIN_LOGIN_VALIDATE_REQUEST,
  payload: pin
});

export const pinFailure = (): PinValidateFailure => ({
  type: PIN_LOGIN_VALIDATE_FAILURE
});

export const pinSuccess = (): PinValidateSuccess => ({
  type: PIN_LOGIN_VALIDATE_SUCCESS
});
