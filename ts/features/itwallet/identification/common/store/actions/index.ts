import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

export const itwHasNfcFeature = createAsyncAction(
  "ITW_HAS_NFC_FEATURE_REQUEST",
  "ITW_HAS_NFC_FEATURE_SUCCESS",
  "ITW_HAS_NFC_FEATURE_FAILURE"
)<void, boolean, Error>();

export const itwRestrictedMode = createStandardAction(
  "ITW_RESTRICTED_MODE"
)<boolean>();

export type ItwIdentificationActions =
  | ActionType<typeof itwHasNfcFeature>
  | ActionType<typeof itwRestrictedMode>;
