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

export const isWalletPaymentsRedirectBannerVisibleSelector = (
  state: GlobalState
) => state.features.wallet.preferences.shouldShowPaymentsRedirectBanner;

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const selectWalletCards = createSelector(selectWalletFeature, wallet =>
  Object.values(wallet.cards)
);

/**
 * Gets the cards sorted by their category order, specified in the {@see walletCardCategories} array
 */
export const selectSortedWalletCards = createSelector(
  selectWalletCards,
  cards =>
    [...cards].sort(
      (a, b) =>
        walletCardCategories.indexOf(a.category) -
        walletCardCategories.indexOf(b.category)
    )
);

/**
 * Only gets cards which are part of the IT Wallet
 */
export const selectWalletItwCards = createSelector(
  selectSortedWalletCards,
  cards => cards.filter(({ category }) => category === "itw")
);

/**
 * Only gets cards which are not part of the IT Wallet
 */
export const selectWalletOtherCards = createSelector(
  selectSortedWalletCards,
  cards => cards.filter(({ category }) => category !== "itw")
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

export const selectWalletPlaceholders = createSelector(
  selectWalletFeature,
  wallet => wallet.placeholders.items
);

export const selectIsWalletCardsLoading = (state: GlobalState) =>
  state.features.wallet.placeholders.isLoading;

export const selectWalletPlaceholdersByCategory = createSelector(
  selectWalletPlaceholders,
  groupPlaceholdersByCategory
);

// Returns the categories of cards in the wallet, including placeholders
export const selectWalletCategoriesIncludingPlaceholders = createSelector(
  selectWalletCardsByCategory,
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
