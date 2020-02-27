/**
 * Action types and action creator related to authentication by CIE
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export const setCiePin = createStandardAction("SET_CIE_PIN")<string>();

export const setCieAuthenticationUrl = createStandardAction(
  "SET_CIE_AUTHENTICATION_URL"
)<string>();

export const cieIsSupported = createAsyncAction(
  "CIE_IS_SUPPORTED_REQUEST",
  "CIE_IS_SUPPORTED_SUCCESS",
  "CIE_IS_SUPPORTED_FAILURE"
)<void, boolean, Error>();

export const startWatchingNfcEnablement = createStandardAction(
  "START_WATCHING_NFC_ENABLEMENT"
)();

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

export type CieAuthenticationActions =
  | ActionType<typeof setCiePin>
  | ActionType<typeof setCieAuthenticationUrl>
  | ActionType<typeof cieIsSupported>
  | ActionType<typeof startWatchingNfcEnablement>
  | ActionType<typeof nfcIsEnabled>
  | ActionType<typeof updateReadingState>;
