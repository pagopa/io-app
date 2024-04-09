// TODO remove `NEW_` prefix after legacy wallet removal
// The prefix is to make the route name unique across all navigation routes
export const WalletRoutes = {
  WALLET_NAVIGATOR: "NEW_WALLET_NAVIGATOR",
  WALLET_CARD_ONBOARDING: "NEW_WALLET_CARD_ONBOARDING"
} as const;
