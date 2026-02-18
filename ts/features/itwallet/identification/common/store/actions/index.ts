import { ActionType, createAsyncAction } from "typesafe-actions";

export const itwHasNfcFeature = createAsyncAction(
  "ITW_HAS_NFC_FEATURE_REQUEST",
  "ITW_HAS_NFC_FEATURE_SUCCESS",
  "ITW_HAS_NFC_FEATURE_FAILURE"
)<void, boolean, Error>();

export type ItwIdentificationActions = ActionType<typeof itwHasNfcFeature>;
