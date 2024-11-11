import { ActionType, createStandardAction } from "typesafe-actions";

export const itwStoreIntegrityKeyTag = createStandardAction(
  "ITW_STORE_INTEGRITY_KEY_TAG"
)<string>();

export const itwRemoveIntegrityKeyTag = createStandardAction(
  "ITW_REMOVE_INTEGRITY_KEY_TAG"
)<void>();

export const itwIntegritySetServiceIsReady = createStandardAction(
  "ITW_INTEGRITY_SET_SERVICE_IS_READY"
)<boolean>();

export type ItwIssuanceActions =
  | ActionType<typeof itwStoreIntegrityKeyTag>
  | ActionType<typeof itwRemoveIntegrityKeyTag>
  | ActionType<typeof itwIntegritySetServiceIsReady>;
