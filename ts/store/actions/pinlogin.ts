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

export type PinLoginValidateSuccess = Readonly<{
  type: typeof PIN_LOGIN_VALIDATE_SUCCESS;
}>;

export type PinLoginValidateFailure = Readonly<{
  type: typeof PIN_LOGIN_VALIDATE_FAILURE;
}>;

export type PinLoginValidateRequest = Readonly<{
  type: typeof PIN_LOGIN_VALIDATE_REQUEST;
  payload: PinString;
}>;

export type PinloginActions =
  | PinLoginValidateFailure
  | PinLoginValidateRequest
  | PinLoginValidateSuccess;

// Send the PIN to be match with the one in the keychain
export const pinLoginValidateRequest = (
  pin: PinString
): PinLoginValidateRequest => ({
  type: PIN_LOGIN_VALIDATE_REQUEST,
  payload: pin
});

export const pinLoginValidateFailure = (): PinLoginValidateFailure => ({
  type: PIN_LOGIN_VALIDATE_FAILURE
});

export const pinLoginValidateSuccess = (): PinLoginValidateSuccess => ({
  type: PIN_LOGIN_VALIDATE_SUCCESS
});
