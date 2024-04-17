import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCard, WalletCardCategory } from "../../types";

const groupCardsByCategory = (cards: ReadonlyArray<WalletCard>) =>
  cards.reduce(
    (acc, card) => ({
      ...acc,
      [card.category]: [...(acc[card.category] || []), card]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<WalletCard> }
  );

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
  groupCardsByCategory
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

export const selectFilteredWalletCards = createSelector(
  selectWalletCards,
  selectWalletCategoryFilter,
  (cards, categoryFilter) =>
    cards.filter(card =>
      categoryFilter ? card.category === categoryFilter : true
    )
);

export const getWalletCardsByCategoryWithFilterSelector = createSelector(
  selectFilteredWalletCards,
  groupCardsByCategory
);
