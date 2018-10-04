/**
 * Action types and action creator related to the PinLogin.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

import { PinString } from "../../types/PinString";

// Send the PIN to be match with the one in the keychain
export const pinLoginValidateRequest = createStandardAction(
  "PIN_LOGIN_VALIDATE_REQUEST"
)<PinString>();

export const pinLoginValidateFailure = createStandardAction(
  "PIN_LOGIN_VALIDATE_FAILURE"
)();

export const pinLoginValidateSuccess = createStandardAction(
  "PIN_LOGIN_VALIDATE_SUCCESS"
)();

export type PinloginActions = ActionType<
  | typeof pinLoginValidateFailure
  | typeof pinLoginValidateRequest
  | typeof pinLoginValidateSuccess
>;
