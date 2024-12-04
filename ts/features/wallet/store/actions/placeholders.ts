import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCard } from "../../types";

export const walletToggleLoadingState = createStandardAction(
  "WALLET_TOGGLE_LOADING_STATE"
)<boolean>();

export const walletResetPlaceholders = createStandardAction(
  "WALLET_RESET_PLACEHOLDERS"
)<ReadonlyArray<WalletCard>>();

export type WalletPlaceholdersActions =
  | ActionType<typeof walletToggleLoadingState>
  | ActionType<typeof walletResetPlaceholders>;
