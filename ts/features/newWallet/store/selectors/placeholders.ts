import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletCardCategory } from "../../types";
import { WalletPlaceholdersState } from "../reducers/placeholders";

const countCardsByCategory = (categories: ReadonlyArray<WalletCardCategory>) =>
  categories.reduce(
    (acc, category) => ({
      ...acc,
      [category]: (acc[category] ?? 0) + 1
    }),
    {} as { [category in WalletCardCategory]: number }
  );

const groupCardsByCategory = (placeholders: WalletPlaceholdersState) =>
  Object.entries(placeholders).reduce(
    (acc, [key, category]) => ({
      ...acc,
      [category]: [...(acc[category] ?? []), key]
    }),
    {} as { [category in WalletCardCategory]: ReadonlyArray<string> }
  );

const selectWalletPlaceholders = (state: GlobalState) =>
  state.features.wallet.placeholders;

export const getWalletPlaceholdersCountByCategorySelector = createSelector(
  selectWalletPlaceholders,
  placeholders => countCardsByCategory(Object.values(placeholders))
);

export const getWalletPlaceholdersByCategorySelector = createSelector(
  selectWalletPlaceholders,
  groupCardsByCategory
);
