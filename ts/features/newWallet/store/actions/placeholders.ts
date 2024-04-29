import { ActionType, createStandardAction } from "typesafe-actions";

export const walletToggleLoadingState = createStandardAction(
  "WALLET_TOGGLE_LOADING_STATE"
)<boolean>();

export type WalletPlaceholdersActions = ActionType<
  typeof walletToggleLoadingState
>;
