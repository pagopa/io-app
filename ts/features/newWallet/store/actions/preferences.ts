import { ActionType, createStandardAction } from "typesafe-actions";

export const walletSetPaymentsRedirectBannerVisible = createStandardAction(
  "WALLET_SET_PAYMENTS_REDIRECT_BANNER_VISIBLE"
)<boolean>();

export type WalletPreferencesActions = ActionType<
  typeof walletSetPaymentsRedirectBannerVisible
>;
