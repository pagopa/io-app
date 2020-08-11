/**
 * Action types and action creator related to authentication by CIE
 */

import { Event as CEvent } from "@pagopa/react-native-cie";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export type CieEvent =
  | CEvent["event"]
  | "READ_SUCCESS"
  | "DATA_CONSENT_SUCCESS"
  | "DATA_CONSENT_ERROR";

export const hasApiLevelSupport = createAsyncAction(
  "CIE_HAS_API_LEVEL_REQUEST",
  "CIE_HAS_API_LEVEL_SUCCESS",
  "CIE_HAS_API_LEVEL_FAILURE"
)<void, boolean, Error>();

export const hasNFCFeature = createAsyncAction(
  "CIE_HAS_NFC_FEATURE_REQUEST",
  "CIE_HAS_NFC_FEATURE_SUCCESS",
  "CIE_HAS_NFC_FEATURE_FAILURE"
)<void, boolean, Error>();

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

/**
 * Action used to send CIE Events to Mixpanel
 */
export const cieEventEmit = createStandardAction("CIE_EVENT_EMIT")<CieEvent>();

export type CieAuthenticationActions =
  | ActionType<typeof hasApiLevelSupport>
  | ActionType<typeof hasNFCFeature>
  | ActionType<typeof cieIsSupported>
  | ActionType<typeof nfcIsEnabled>
  | ActionType<typeof updateReadingState>
  | ActionType<typeof cieEventEmit>;
