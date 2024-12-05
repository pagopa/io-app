import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCard, walletCardCategories } from "../../types";

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const selectWalletPlaceholders = createSelector(
  selectWalletFeature,
  wallet =>
    Object.entries(wallet.placeholders.items).map(
      ([key, category]) =>
        ({ key, category, type: "placeholder" } as WalletCard)
    )
);

export const selectWalletCards = createSelector(selectWalletFeature, wallet => {
  const { deletedCard, ...cards } = wallet.cards;
  return Object.values(cards);
});

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

export const selectIsWalletCardsLoading = (state: GlobalState) =>
  state.features.wallet.placeholders.isLoading;

export const selectWalletCategoryFilter = createSelector(
  selectWalletFeature,
  wallet => wallet.preferences.categoryFilter
);

export const selectWalletPaymentMethods = createSelector(
  selectSortedWalletCards,
  cards => cards.filter(({ category }) => category === "payment")
);

export const selectWalletCgnCard = createSelector(
  selectSortedWalletCards,
  cards => cards.filter(({ category }) => category === "cgn")
);

export const selectBonusCards = createSelector(selectSortedWalletCards, cards =>
  cards.filter(({ category }) => category === "bonus")
);
