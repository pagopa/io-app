import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/string";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import {
  WalletCard,
  WalletCardCategory,
  walletCardCategories
} from "../../types";
import { WalletPlaceholders } from "../reducers/placeholders";

const groupCardsByCategory = (cards: ReadonlyArray<WalletCard>) =>
  cards.reduce(
    (acc, card) => ({
      ...acc,
      [card.category]: [...(acc[card.category] || []), card]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<WalletCard> }
  );

const groupPlaceholdersByCategory = (placeholders: WalletPlaceholders) =>
  Object.entries(placeholders).reduce(
    (acc, [key, category]) => ({
      ...acc,
      [category]: [...(acc[category] ?? []), key]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<string> }
  );

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const isWalletPaymentsRedirectBannerVisibleSelector = createSelector(
  selectWalletFeature,
  wallet => wallet.preferences.shouldShowPaymentsRedirectBanner
);

export const selectWalletCards = createSelector(selectWalletFeature, wallet =>
  Object.values(wallet.cards)
);

export const selectWalletCardsByCategory = createSelector(
  selectWalletCards,
  groupCardsByCategory
);

export const getWalletCardsCategorySelector = (category: WalletCardCategory) =>
  createSelector(
    selectWalletCardsByCategory,
    cardsByCategory => cardsByCategory[category]
  );

export const selectWalletCategoryFilter = createSelector(
  selectWalletFeature,
  wallet => wallet.preferences.categoryFilter
);

const selectFilteredWalletCards = createSelector(
  selectWalletCards,
  selectWalletCategoryFilter,
  (cards, categoryFilter) =>
    cards.filter(card =>
      categoryFilter ? card.category === categoryFilter : true
    )
);

export const selectWalletCardsByCategoryWithFilter = createSelector(
  selectFilteredWalletCards,
  groupCardsByCategory
);

export const selectWalletPlaceholders = createSelector(
  selectWalletFeature,
  wallet => wallet.placeholders.items
);

export const selectIsWalletCardsLoading = createSelector(
  selectWalletFeature,
  wallet => wallet.placeholders.isLoading
);

const selectFilteredWalletPlaceholders = createSelector(
  selectWalletPlaceholders,
  selectWalletCategoryFilter,
  (placeholders, categoryFilter) =>
    Object.fromEntries(
      Object.entries(placeholders).filter(([_, category]) =>
        categoryFilter ? category === categoryFilter : true
      )
    )
);

export const selectWalletPlaceholdersByCategory = createSelector(
  selectFilteredWalletPlaceholders,
  groupPlaceholdersByCategory
);

// Returns the categories of cards in the wallet, including placeholders
export const selectWalletCategoriesIncludingPlaceholders = createSelector(
  selectWalletCardsByCategoryWithFilter,
  selectWalletPlaceholdersByCategory,
  (cardsByCategory, placeholdersByCategory) =>
    pipe(
      [...Object.keys(cardsByCategory), ...Object.keys(placeholdersByCategory)],
      A.uniq(S.Eq),
      A.filter((cat: string): cat is WalletCardCategory =>
        walletCardCategories.includes(cat as WalletCardCategory)
      )
    )
);
