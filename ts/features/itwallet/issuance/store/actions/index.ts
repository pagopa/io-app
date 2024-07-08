import { ActionType, createStandardAction } from "typesafe-actions";

export const itwStoreHardwareKeyTag = createStandardAction(
  "ITW_STORE_HARDWARE_KEY_TAG"
)<string>();

export const itwRemoveHardwareKeyTag = createStandardAction(
  "ITW_REMOVE_HARDWARE_KEY_TAG"
)<void>();

export type ItwIssuanceActions =
  | ActionType<typeof itwStoreHardwareKeyTag>
  | ActionType<typeof itwRemoveHardwareKeyTag>;
