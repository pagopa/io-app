import { Event as CEvent } from "@pagopa/react-native-cie";
/** Action types and action creator related to authentication by CIE */
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { LoginType } from "../../../../activeSessionLogin/screens/analytics";

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

export type CieAuthenticationErrorPayload = {
  cieDescription?: string;
  flow: LoginType;
  reason: CieAuthenticationErrorReason;
};

export type CieAuthenticationErrorReason = "GENERIC" | CEvent["event"];

export const cieAuthenticationError = createStandardAction(
  "CIE_AUTHENTICATION_ERROR"
)<CieAuthenticationErrorPayload>();

export type CieAuthenticationActions =
  | ActionType<typeof cieAuthenticationError>
  | ActionType<typeof cieIsSupported>
  | ActionType<typeof nfcIsEnabled>;
