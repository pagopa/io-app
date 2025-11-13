import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { orderCategoriesByNameKey } from "../../utils/filters";
import { cgnCategories } from "../actions/categories";

export type CgnCategoriesState = {
  list: pot.Pot<
    ReadonlyArray<ProductCategoryWithNewDiscountsCount>,
    NetworkError
  >;
};

const INITIAL_STATE: CgnCategoriesState = {
  list: pot.none
};

const reducer = (
  state: CgnCategoriesState = INITIAL_STATE,
  action: Action
): CgnCategoriesState => {
  switch (action.type) {
    // Categories List
    case getType(cgnCategories.request):
      return {
        ...state,
        list: pot.toLoading(state.list)
      };
    case getType(cgnCategories.success):
      return {
        ...state,
        list: pot.some(orderCategoriesByNameKey(action.payload))
      };
    case getType(cgnCategories.failure):
      return {
        ...state,
        list: pot.toError(state.list, action.payload)
      };
  }
  return state;
};

export default reducer;

const cgnCategoriesSelector = (state: GlobalState) =>
  state.bonus.cgn.categories;

export const cgnCategoriesListSelector = createSelector(
  cgnCategoriesSelector,
  categories => categories.list
);
