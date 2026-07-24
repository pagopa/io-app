import { ActionType, createStandardAction } from "typesafe-actions";

import { WalletCardCategoryFilter } from "../../types";

export const walletSetCategoryFilter = createStandardAction(
  "WALLET_SET_CATEGORY_FILTER"
)<undefined | WalletCardCategoryFilter>();

export type WalletPreferencesActions = ActionType<
  typeof walletSetCategoryFilter
>;
