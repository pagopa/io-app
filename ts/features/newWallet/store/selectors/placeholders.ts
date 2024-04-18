import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCardCategory } from "../../types";

const countCardsByCategory = (categories: ReadonlyArray<WalletCardCategory>) =>
  categories.reduce(
    (acc, category) => ({
      ...acc,
      [category]: (acc[category] ?? 0) + 1
    }),
    {} as { [category in WalletCardCategory]: number }
  );

const selectWalletPlaceholders = (state: GlobalState) =>
  Object.values(state.features.wallet.placeholders);

export const getWalletPlaceholdersCountByCategorySelector = createSelector(
  selectWalletPlaceholders,
  countCardsByCategory
);
