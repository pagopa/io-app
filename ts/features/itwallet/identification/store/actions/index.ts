import { ActionType, createAsyncAction } from "typesafe-actions";

export const itwNfcIsEnabled = createAsyncAction(
  "ITW_NFC_IS_ENABLED_REQUEST",
  "ITW_NFC_IS_ENABLED_SUCCESS",
  "ITW_NFC_IS_ENABLED_FAILURE"
)<void, boolean, Error>();

export const itwCieIsSupported = createAsyncAction(
  "ITW_CIE_IS_SUPPORTED_REQUEST",
  "ITW_CIE_IS_SUPPORTED_SUCCESS",
  "ITW_CIE_IS_SUPPORTED_FAILURE"
)<void, boolean, Error>();

export type ItwIdentificationActions =
  | ActionType<typeof itwNfcIsEnabled>
  | ActionType<typeof itwCieIsSupported>;
