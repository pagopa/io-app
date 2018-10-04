/**
 * Action types and action creator related to setting and resetting the PIN.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

import { PinString } from "../../types/PinString";

export const startPinReset = createStandardAction("START_PIN_RESET")();

export const createPin = createStandardAction("PIN_CREATE_REQUEST")<
  PinString
>();

export const createPinSuccess = createStandardAction("PIN_CREATE_SUCCESS")();

export const createPinFailure = createStandardAction("PIN_CREATE_FAILURE")();

export type PinSetActions =
  | ActionType<typeof startPinReset>
  | ActionType<typeof createPin>
  | ActionType<typeof createPinSuccess>
  | ActionType<typeof createPinFailure>;
