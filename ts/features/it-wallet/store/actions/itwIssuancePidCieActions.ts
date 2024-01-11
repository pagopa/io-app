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

export const itwHasApiLevelSupport = createAsyncAction(
  "ITW_CIE_HAS_API_LEVEL_REQUEST",
  "ITW_CIE_HAS_API_LEVEL_SUCCESS",
  "ITW_CIE_HAS_API_LEVEL_FAILURE"
)<void, boolean, Error>();

export const itwHasNFCFeature = createAsyncAction(
  "ITW_CIE_HAS_NFC_FEATURE_REQUEST",
  "ITW_CIE_HAS_NFC_FEATURE_SUCCESS",
  "ITW_CIE_HAS_NFC_FEATURE_FAILURE"
)<void, boolean, Error>();

export const itwCieIsSupported = createAsyncAction(
  "ITW_CIE_IS_SUPPORTED_REQUEST",
  "ITW_CIE_IS_SUPPORTED_SUCCESS",
  "ITW_CIE_IS_SUPPORTED_FAILURE"
)<void, boolean, Error>();

export const itwNfcIsEnabled = createAsyncAction(
  "ITW_NFC_IS_ENABLED_REQUEST",
  "ITW_NFC_IS_ENABLED_SUCCESS",
  "ITW_NFC_IS_ENABLED_FAILURE"
)<void, boolean, Error>();

export const itwUpdateReadingState = createAsyncAction(
  "ITW_UPDATE_READING_STATE_REQUEST",
  "ITW_UPDATE_READING_STATE_SUCCESS",
  "ITW_UPDATE_READING_STATE_FAILURE"
)<void, string, Error>();

export const itwLoginSuccess = createStandardAction("ITW_LOGIN_SUCCESS")<{
  token: SessionToken;
  idp: keyof IdpData;
}>();

export const itwLoginFailure = createStandardAction("ITW_LOGIN_FAILURE")<{
  error: Error;
  idp: keyof IdpData | undefined;
}>();

export type ItwCieAuthenticationErrorReason = CEvent["event"] | "GENERIC";

export type ItwCieAuthenticationErrorPayload = {
  reason: ItwCieAuthenticationErrorReason;
  cieDescription?: string;
};

export const itwCieAuthenticationError = createStandardAction(
  "ITW_CIE_AUTHENTICATION_ERROR"
)<ItwCieAuthenticationErrorPayload>();

export type ItwIssuancePidCieAuthActions =
  | ActionType<typeof itwHasApiLevelSupport>
  | ActionType<typeof itwHasNFCFeature>
  | ActionType<typeof itwCieIsSupported>
  | ActionType<typeof itwNfcIsEnabled>
  | ActionType<typeof itwUpdateReadingState>
  | ActionType<typeof itwCieAuthenticationError>
  | ActionType<typeof itwLoginSuccess>
  | ActionType<typeof itwLoginFailure>;
