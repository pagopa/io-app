import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCardsActions } from "./cards";
import { WalletPlaceholdersActions } from "./placeholders";
import { WalletPreferencesActions } from "./preferences";

/**
 * Action for requesting an update of the wallet info that can be called by any screen/saga
 */
export const walletUpdate = createStandardAction("WALLET_UPDATE")();

type WalletBaseActions = ActionType<typeof walletUpdate>;

export type WalletActions =
  | WalletBaseActions
  | WalletCardsActions
  | WalletPreferencesActions
  | WalletPlaceholdersActions;
