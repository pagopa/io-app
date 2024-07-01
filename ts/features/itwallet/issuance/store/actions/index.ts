import { ActionType, createStandardAction } from "typesafe-actions";

export const itwStoreHardwareKeyTag = createStandardAction(
  "ITW_STORE_HARDWARE_KEY_TAG"
)<string>();

export type ItwIssuanceActions = ActionType<typeof itwStoreHardwareKeyTag>;
