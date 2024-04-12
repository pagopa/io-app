import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletCardCategory } from "../../types";

export const walletSetPaymentsRedirectBannerVisible = createStandardAction(
  "WALLET_SET_PAYMENTS_REDIRECT_BANNER_VISIBLE"
)<boolean>();

export const walletSetCategoryFilter = createStandardAction(
  "WALLET_SET_CATEGORY_FILTER"
)<WalletCardCategory | undefined>();

export type WalletPreferencesActions =
  | ActionType<typeof walletSetPaymentsRedirectBannerVisible>
  | ActionType<typeof walletSetCategoryFilter>;
