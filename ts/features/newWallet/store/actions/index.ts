import { WalletCardsActions } from "./cards";
import { WalletPlaceholdersActions } from "./placeholders";
import { WalletPreferencesActions } from "./preferences";

export type WalletActions =
  | WalletCardsActions
  | WalletPreferencesActions
  | WalletPlaceholdersActions;
