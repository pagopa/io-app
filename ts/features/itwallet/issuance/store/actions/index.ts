import { ActionType, createStandardAction } from "typesafe-actions";

export const itwStoreIntegrityKeyTag = createStandardAction(
  "ITW_STORE_INTEGRITY_KEY_TAG"
)<string>();

export const itwRemoveIntegrityKeyTag = createStandardAction(
  "ITW_REMOVE_HARDWARE_KEY_TAG"
)<void>();

export type ItwIssuanceActions =
  | ActionType<typeof itwStoreIntegrityKeyTag>
  | ActionType<typeof itwRemoveIntegrityKeyTag>;
