import { ActionType, createStandardAction } from "typesafe-actions";
import { IntegrityServiceStatus } from "../reducers";

export const itwStoreIntegrityKeyTag = createStandardAction(
  "ITW_STORE_INTEGRITY_KEY_TAG"
)<string>();

export const itwRemoveIntegrityKeyTag = createStandardAction(
  "ITW_REMOVE_INTEGRITY_KEY_TAG"
)<void>();

export const itwSetIntegrityServiceStatus = createStandardAction(
  "ITW_SET_INTEGRITY_SERVICE_STATUS"
)<IntegrityServiceStatus>();

export type ItwIssuanceActions =
  | ActionType<typeof itwStoreIntegrityKeyTag>
  | ActionType<typeof itwRemoveIntegrityKeyTag>
  | ActionType<typeof itwSetIntegrityServiceStatus>;
