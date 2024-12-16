import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCardsActions } from "./cards";
import { WalletPlaceholdersActions } from "./placeholders";
import { WalletPreferencesActions } from "./preferences";

/**
 * Action to trigger the update the content of the wallet screen
 */
export const walletUpdate = createStandardAction("WALLET_UPDATE")();

export type WalletActions =
  | ActionType<typeof walletUpdate>
  | WalletCardsActions
  | WalletPreferencesActions
  | WalletPlaceholdersActions;
