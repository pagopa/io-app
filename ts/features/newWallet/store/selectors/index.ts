import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCardCategory } from "../../types";

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const isWalletPaymentsRedirectBannerVisibleSelector = (
  state: GlobalState
) =>
  pipe(
    state,
    selectWalletFeature,
    wallet => wallet.preferences.shouldShowPaymentsRedirectBanner
  );

export const selectWalletCards = (state: GlobalState) =>
  pipe(state, selectWalletFeature, wallet => Object.values(wallet.cards));

export const selectWalletCardsByCategory = (category: WalletCardCategory) =>
  createSelector(selectWalletFeature, wallet => wallet.cards[category]);
