import { Event as CEvent } from "@pagopa/react-native-cie";
/**
 * Action types and action creator related to authentication by CIE
 */

import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { SessionToken } from "../../../../types/SessionToken";
import { IdpData } from "../../../../../definitions/content/IdpData";

export const hasApiLevelSupport = createAsyncAction(
  "ITW_CIE_HAS_API_LEVEL_REQUEST",
  "ITW_CIE_HAS_API_LEVEL_SUCCESS",
  "ITW_CIE_HAS_API_LEVEL_FAILURE"
)<void, boolean, Error>();

export const hasNFCFeature = createAsyncAction(
  "ITW_CIE_HAS_NFC_FEATURE_REQUEST",
  "ITW_CIE_HAS_NFC_FEATURE_SUCCESS",
  "ITW_CIE_HAS_NFC_FEATURE_FAILURE"
)<void, boolean, Error>();

export const cieIsSupported = createAsyncAction(
  "ITW_CIE_IS_SUPPORTED_REQUEST",
  "ITW_CIE_IS_SUPPORTED_SUCCESS",
  "ITW_CIE_IS_SUPPORTED_FAILURE"
)<void, boolean, Error>();

export const nfcIsEnabled = createAsyncAction(
  "ITW_NFC_IS_ENABLED_REQUEST",
  "ITW_NFC_IS_ENABLED_SUCCESS",
  "ITW_NFC_IS_ENABLED_FAILURE"
)<void, boolean, Error>();

export const updateReadingState = createAsyncAction(
  "ITW_UPDATE_READING_STATE_REQUEST",
  "ITW_UPDATE_READING_STATE_SUCCESS",
  "ITW_UPDATE_READING_STATE_FAILURE"
)<void, string, Error>();

export const loginSuccess = createStandardAction("ITW_LOGIN_SUCCESS")<{
  token: SessionToken;
  idp: keyof IdpData;
}>();

export const loginFailure = createStandardAction("ITW_LOGIN_FAILURE")<{
  error: Error;
  idp: keyof IdpData | undefined;
}>();

export type CieAuthenticationErrorReason = CEvent["event"] | "GENERIC";

export type CieAuthenticationErrorPayload = {
  reason: CieAuthenticationErrorReason;
  cieDescription?: string;
};

export const cieAuthenticationError = createStandardAction(
  "ITW_CIE_AUTHENTICATION_ERROR"
)<CieAuthenticationErrorPayload>();

export type ItwCieAuthenticationActions =
  | ActionType<typeof hasApiLevelSupport>
  | ActionType<typeof hasNFCFeature>
  | ActionType<typeof cieIsSupported>
  | ActionType<typeof nfcIsEnabled>
  | ActionType<typeof updateReadingState>
  | ActionType<typeof cieAuthenticationError>
  | ActionType<typeof loginSuccess>
  | ActionType<typeof loginFailure>;
