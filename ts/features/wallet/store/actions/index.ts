import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCardsActions } from "./cards";
import { WalletPlaceholdersActions } from "./placeholders";
import { WalletPreferencesActions } from "./preferences";

/**
 * Action to trigger the update of the wallet screen content
 */
export const walletUpdate = createStandardAction("WALLET_UPDATE")();

type WalletBaseActions = ActionType<typeof walletUpdate>;

export type WalletActions =
  | WalletBaseActions
  | WalletCardsActions
  | WalletPreferencesActions
  | WalletPlaceholdersActions;
