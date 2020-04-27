/**
 * Action types and action creator related to authentication by CIE
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export const cieIsSupported = createAsyncAction(
  "CIE_IS_SUPPORTED_REQUEST",
  "CIE_IS_SUPPORTED_SUCCESS",
  "CIE_IS_SUPPORTED_FAILURE"
)<void, boolean, Error>();

export const nfcIsEnabled = createAsyncAction(
  "NFC_IS_ENABLED_REQUEST",
  "NFC_IS_ENABLED_SUCCESS",
  "NFC_IS_ENABLED_FAILURE"
)<void, boolean, Error>();

export const updateReadingState = createAsyncAction(
  "UPDATE_READING_STATE_REQUEST",
  "UPDATE_READING_STATE_SUCCESS",
  "UPDATE_READING_STATE_FAILURE"
)<void, string, Error>();

export const cieAuthenticationError = createStandardAction(
  "CIE_AUTHENTICATION_ERROR"
)<Error>();

export type CieAuthenticationActions =
  | ActionType<typeof cieIsSupported>
  | ActionType<typeof nfcIsEnabled>
  | ActionType<typeof updateReadingState>
  | ActionType<typeof cieAuthenticationError>;
