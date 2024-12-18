import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { isSomeLoadingOrSomeUpdating } from "../../../../utils/pot";
import { cgnDetailSelector } from "../../../bonus/cgn/store/reducers/details";
import { idPayWalletInitiativeListSelector } from "../../../idpay/wallet/store/reducers";
import { itwLifecycleIsValidSelector } from "../../../itwallet/lifecycle/store/selectors";
import { paymentsWalletUserMethodsSelector } from "../../../payments/wallet/store/selectors";
import {
  WalletCard,
  WalletCardCategory,
  WalletCardType,
  walletCardCategories
} from "../../types";
import { WalletCardCategoryFilter } from "../../types/index";

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

/**
 * Returns the list of cards excluding hidden cards
 */
export const selectWalletCards = createSelector(
  selectWalletFeature,
  ({ cards }) => Object.values(cards).filter(({ hidden }) => !hidden)
);

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

/**
 * Selects the cards by their category
 * @param category - The category of the cards to select
 */
export const selectWalletCardsByCategory = createSelector(
  selectSortedWalletCards,
  (_: GlobalState, category: WalletCardCategory) => category,
  (cards, category) =>
    cards.filter(({ category: cardCategory }) => cardCategory === category)
);

/**
 * Selects the cards by their type
 * @param type - The type of the cards to select
 */
export const selectWalletCardsByType = createSelector(
  selectSortedWalletCards,
  (_: GlobalState, type: WalletCardType) => type,
  (cards, type) => cards.filter(({ type: cardType }) => cardType === type)
);

/**
 * Selects the loading state of the wallet cards
 */
export const selectIsWalletCardsLoading = (state: GlobalState) =>
  state.features.wallet.placeholders.isLoading;

/**
 * Selects the placeholders from the wallet
 */
export const selectWalletPlaceholders = createSelector(
  selectWalletFeature,
  wallet =>
    Object.entries(wallet.placeholders.items).map(
      ([key, category]) =>
        ({ key, category, type: "placeholder" } as WalletCard)
    )
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

/**
 * Returns true if the wallet screen is refreshing
 * Extend this selector to add new selectors to the check if the wallet screen is refreshing
 */
export const isWalletScreenRefreshingSelector = (state: GlobalState) =>
  isSomeLoadingOrSomeUpdating(paymentsWalletUserMethodsSelector(state)) ||
  isSomeLoadingOrSomeUpdating(idPayWalletInitiativeListSelector(state)) ||
  isSomeLoadingOrSomeUpdating(cgnDetailSelector(state));

/**
 * Selects the category filter from the wallet preferences
 */
export const selectWalletCategoryFilter = (state: GlobalState) =>
  state.features.wallet.preferences.categoryFilter;

/**
 * Checks if a wallet category section should be rendered. A category section is rendered if:
 * - no category filter is selected, or
 * - the filter matches the given category, or
 * - the wallet contains only one category
 */
export const shouldRenderWalletCategorySelector = createSelector(
  selectWalletCategoryFilter,
  selectWalletCategories,
  (_: GlobalState, category: WalletCardCategoryFilter) => category,
  (filter, categories, category) =>
    filter === undefined || filter === category || categories.size <= 0
);
