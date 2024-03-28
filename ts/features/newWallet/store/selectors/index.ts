import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCard, WalletCardCategory } from "../../types";

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
