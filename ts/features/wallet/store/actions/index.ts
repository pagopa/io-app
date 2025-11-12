import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCardsActions } from "./cards";
import { WalletPlaceholdersActions } from "./placeholders";
import { WalletPreferencesActions } from "./preferences";

/**
 * Action to trigger the update of the wallet screen content
 */
export const walletUpdate = createStandardAction("WALLET_UPDATE")();

/**
 * Action for external wallet update requests.
 * This action is dispatched only when wallet updates are needed due to external deep links.
 */
export const externalWalletUpdate = createStandardAction(
  "EXTERNAL_WALLET_UPDATE"
)();

type WalletBaseActions = ActionType<
  typeof walletUpdate | typeof externalWalletUpdate
>;

export type WalletActions =
  | WalletBaseActions
  | WalletCardsActions
  | WalletPreferencesActions
  | WalletPlaceholdersActions;
