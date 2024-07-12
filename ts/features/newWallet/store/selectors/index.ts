import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import {
  WalletCard,
  WalletCardCategory,
  walletCardCategories
} from "../../types";

const groupCardsByCategory = (cards: ReadonlyArray<WalletCard>) =>
  cards.reduce(
    (acc, card) => ({
      ...acc,
      [card.category]: [...(acc[card.category] || []), card]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<WalletCard> }
  );

export const isWalletPaymentsRedirectBannerVisibleSelector = (
  state: GlobalState
) => state.features.wallet.preferences.shouldShowPaymentsRedirectBanner;

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const selectWalletPlaceholders = createSelector(
  selectWalletFeature,
  wallet =>
    Object.entries(wallet.placeholders.items).map(
      ([key, category]) =>
        ({ key, category, type: "placeholder" } as WalletCard)
    )
);

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

export const selectIsWalletCardsLoading = (state: GlobalState) =>
  state.features.wallet.placeholders.isLoading;
