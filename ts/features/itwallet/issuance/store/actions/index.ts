import { ActionType, createStandardAction } from "typesafe-actions";

export const itwStoreIntegrityKeyTag = createStandardAction(
  "ITW_STORE_INTEGRITY_KEY_TAG"
)<string>();

export type ItwIssuanceActions = ActionType<typeof itwStoreIntegrityKeyTag>;
