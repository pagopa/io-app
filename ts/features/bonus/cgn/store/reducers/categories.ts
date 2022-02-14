import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { cgnSelectedCategory } from "../actions/categories";

export type CgnCategoriesState = {
  selectedCategory: ProductCategoryEnum | undefined;
};

const INITIAL_STATE: CgnCategoriesState = {
  selectedCategory: undefined
};

const reducer = (
  state: CgnCategoriesState = INITIAL_STATE,
  action: Action
): CgnCategoriesState => {
  switch (action.type) {
    // Selected Category
    case getType(cgnSelectedCategory):
      return {
        ...state,
        selectedCategory: action.payload
      };
  }
  return state;
};

export default reducer;

export const cgnCategoriesSelector = (state: GlobalState) =>
  state.bonus.cgn.categories;

export const cgnSelectedCategorySelector = createSelector(
  cgnCategoriesSelector,
  categories => categories.selectedCategory
);
