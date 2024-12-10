import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { cgnDetailSelector } from "../../../bonus/cgn/store/reducers/details";
import { itwLifecycleIsValidSelector } from "../../../itwallet/lifecycle/store/selectors";
import { paymentsWalletUserMethodsSelector } from "../../../payments/wallet/store/selectors";
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
 * Returns the list of card categories available in the wallet
 * If there are categories other that ITW, they will become "other"
 */
export const selectWalletCategories = createSelector(
  selectWalletCards,
  itwLifecycleIsValidSelector,
  (cards, isItwValid) => {
    // Get unique categories from cards
    const cardCategories = new Set(
      cards.map(card =>
        // Convert all non-ITW categories to "other"
        card.category === "itw" ? "itw" : "other"
      )
    );

    // Add ITW category if valid, even if no ITW cards exist
    if (isItwValid) {
      cardCategories.add("itw");
    }

    return cardCategories;
  }
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

/**
 * Gets if the wallet can be considered empty.
 * The wallet is empty if there are no categories to display
 * @see selectWalletCategories
 */
export const isWalletEmptySelector = (state: GlobalState) =>
  selectWalletCategories(state).size === 0;

/**
 * The wallet can be considered empty only if we do not have cards stores and there are no errors
 */
export const shouldRenderWalletEmptyStateSelector = (state: GlobalState) =>
  isWalletEmptySelector(state) && // No cards to display
  pot.isSome(paymentsWalletUserMethodsSelector(state)) && // Payment methods are loaded without errors
  !pot.isError(cgnDetailSelector(state)); // CGN is not in error state
