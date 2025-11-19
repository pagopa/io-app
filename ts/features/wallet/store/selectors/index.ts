import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { isSomeLoadingOrSomeUpdating } from "../../../../utils/pot";
import { cgnDetailSelector } from "../../../bonus/cgn/store/reducers/details";
import { idPayWalletInitiativeListSelector } from "../../../idpay/wallet/store/reducers";
import { itwLifecycleIsValidSelector } from "../../../itwallet/lifecycle/store/selectors";
import { paymentsWalletUserMethodsSelector } from "../../../payments/wallet/store/selectors";
import { itwIsWalletInstanceStatusFailureSelector } from "../../../itwallet/walletInstance/store/selectors";
import {
  WalletCard,
  WalletCardCategory,
  WalletCardType,
  walletCardCategories
} from "../../types";
import { WalletCardCategoryFilter } from "../../types/index";
import { isItwEnabledSelector } from "../../../itwallet/common/store/selectors/remoteConfig";
import { isConnectedSelector } from "../../../connectivity/store/selectors";

/**
 * Returns the list of cards excluding hidden cards
 */
export const selectWalletCards = createSelector(
  (state: GlobalState) => state.features.wallet.cards,
  cards => Object.values(cards).filter(({ hidden }) => !hidden)
);

/**
 * Returns the list of card categories available in the wallet
 * If there are categories other that ITW, they will become "other"
 * If the ITW is valid, it will be counted as "itw" category, since we do not have eID card anymore
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
 * Currently, if a card is not part of the IT Wallet, it is considered as "other"
 * This selector returns the cards which are not part of the IT Wallet which must be displayed in the "other" section
 */
export const selectWalletOtherCards = createSelector(
  selectSortedWalletCards,
  cards => cards.filter(({ category }) => category !== "itw")
);

/**
 * Selects the loading state of the wallet cards
 */
export const selectIsWalletLoading = (state: GlobalState) =>
  state.features.wallet.placeholders.isLoading;

/**
 * Selects the placeholders from the wallet
 *
 * Note: We use a nullish coalescing default (?? {}) to prevent runtime errors if the state is malformed
 * or not initialized properly (e.g., during tests, migrations, or hot reloads). This ensures Object.entries
 * always receives an object, avoiding 'Cannot convert undefined value to object' errors.
 */
export const selectWalletPlaceholderCards = createSelector(
  (state: GlobalState) => state.features.wallet.placeholders?.items ?? {},
  placeholders =>
    Object.entries(placeholders).map(
      ([key, category]) =>
        ({ key, category, type: "placeholder" } as WalletCard)
    )
);

/**
 * Gets if the wallet can be considered empty.
 * The wallet is empty if there are no categories to display (@see selectWalletCategories)
 *
 * Note: we check categories because if ITW is valid, it is considered as one category even if there are no cards
 */
export const isWalletEmptySelector = (state: GlobalState) =>
  selectWalletCategories(state).size === 0;

/**
 * The wallet can be considered loading when cards/placeholders are loading AND the wallet is empty.
 * When the wallet is not empty, we show the existing cards alongside the loading placeholders.
 */
export const shouldRenderWalletLoadingStateSelector = (state: GlobalState) =>
  isWalletEmptySelector(state) &&
  (selectIsWalletLoading(state) ||
    pot.isLoading(paymentsWalletUserMethodsSelector(state)) ||
    pot.isLoading(cgnDetailSelector(state)));

/**
 * The wallet can be considered empty only if we do not have cards stored and there are no errors.
 *
 * Error state is checked on payments methods and CGN details, as they are the data sources for wallet cards.
 */
export const shouldRenderWalletEmptyStateSelector = (state: GlobalState) =>
  isWalletEmptySelector(state) &&
  !pot.isError(paymentsWalletUserMethodsSelector(state)) &&
  !pot.isError(cgnDetailSelector(state));

/**
 * Returns true if the wallet screen is refreshing
 * Extend this selector to add new selectors to the check if the wallet screen is refreshing
 */
export const isWalletScreenRefreshingSelector = (state: GlobalState) =>
  isSomeLoadingOrSomeUpdating(paymentsWalletUserMethodsSelector(state)) ||
  isSomeLoadingOrSomeUpdating(idPayWalletInitiativeListSelector(state)) ||
  isSomeLoadingOrSomeUpdating(cgnDetailSelector(state));

/**
 * Selects if the wallet categories can be filtered.
 * The filter is only enabled if there are more than one category available
 */
export const isWalletCategoryFilteringEnabledSelector = createSelector(
  selectWalletCategories,
  categories => categories.size > 1
);

/**
 * Selects the category filter from the wallet preferences
 */
export const selectWalletCategoryFilter = (state: GlobalState) =>
  state.features.wallet.preferences.categoryFilter;

/**
 * Checks if a wallet category section should be rendered. A category section is rendered if:
 * - the category filtering is not enabled, or
 * - no category filter is selected, or
 * - the filter matches the given category
 */
export const shouldRenderWalletCategorySelector = createSelector(
  isWalletCategoryFilteringEnabledSelector,
  selectWalletCategoryFilter,
  (_: GlobalState, category: WalletCardCategoryFilter) => category,
  (isFilteringEnabled, filter, category) =>
    !isFilteringEnabled || filter === undefined || filter === category
);

/**
 * Determines whether the IT Wallet cards section is rendered in the wallet screen.
 * The section is rendered if:
 * - the IT Wallet feature flag is enabled OR the app is in offline mode
 * - the IT Wallet is in a valid lifecycle state
 * - the IT Wallet WI does not have an error
 */
export const shouldRenderItwCardsContainerSelector = (state: GlobalState) =>
  (isItwEnabledSelector(state) || !isConnectedSelector(state)) &&
  itwLifecycleIsValidSelector(state) &&
  !itwIsWalletInstanceStatusFailureSelector(state);
