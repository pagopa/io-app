import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCard, WalletCardCategory } from "../../types";

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const isWalletPaymentsRedirectBannerVisibleSelector = createSelector(
  selectWalletFeature,
  wallet => wallet.preferences.shouldShowPaymentsRedirectBanner
);

export const selectWalletCards = createSelector(selectWalletFeature, wallet =>
  Object.values(wallet.cards)
);

export const getWalletCardsByCategorySelector = createSelector(
  selectWalletCards,
  cards =>
    cards.reduce(
      (acc, card) => ({
        ...acc,
        [card.category]: [...(acc[card.category] || []), card]
      }),
      {} as { [category in WalletCardCategory]: ReadonlyArray<WalletCard> }
    )
);

export const getWalletCardsCategorySelector = (category: WalletCardCategory) =>
  createSelector(
    getWalletCardsByCategorySelector,
    cardsByCategory => cardsByCategory[category]
  );

export const selectWalletCategoryFilter = createSelector(
  selectWalletFeature,
  wallet => wallet.preferences.categoryFilter
);
