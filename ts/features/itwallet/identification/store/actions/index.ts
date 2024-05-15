import { ActionType, createAsyncAction } from "typesafe-actions";

export const itwNfcIsEnabled = createAsyncAction(
  "ITW_NFC_IS_ENABLED_REQUEST",
  "ITW_NFC_IS_ENABLED_SUCCESS",
  "ITW_NFC_IS_ENABLED_FAILURE"
)<void, boolean, Error>();

export type ItwIdentificationActions = ActionType<typeof itwNfcIsEnabled>;
