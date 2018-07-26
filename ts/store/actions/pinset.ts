/**
 * Action types and action creator related to setting and resetting the PIN.
 */

import { PinString } from "../../types/PinString";

import {
  PIN_CREATE_FAILURE,
  PIN_CREATE_REQUEST,
  PIN_CREATE_SUCCESS,
  START_PIN_RESET,
  START_PIN_SET
} from "./constants";

// Actions

export type StartPinSet = Readonly<{
  type: typeof START_PIN_SET;
}>;

export type StartPinReset = Readonly<{
  type: typeof START_PIN_RESET;
}>;

export type PinCreateRequest = Readonly<{
  type: typeof PIN_CREATE_REQUEST;
  // The selected PIN
  payload: PinString;
}>;

export type PinCreateSuccess = Readonly<{
  type: typeof PIN_CREATE_SUCCESS;
}>;

export type PinCreateFailure = Readonly<{
  type: typeof PIN_CREATE_FAILURE;
}>;

export type PinSetActions =
  | StartPinSet
  | StartPinReset
  | PinCreateRequest
  | PinCreateSuccess
  | PinCreateFailure;

// Creators

export const startPinSet = (): StartPinSet => ({
  type: START_PIN_SET
});

export const startPinReset = (): StartPinReset => ({
  type: START_PIN_RESET
});

export const createPin = (pin: PinString): PinCreateRequest => ({
  type: PIN_CREATE_REQUEST,
  payload: pin
});
