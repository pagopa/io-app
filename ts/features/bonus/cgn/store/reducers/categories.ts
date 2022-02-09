import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { cgnCategories, cgnSelectedCategory } from "../actions/categories";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";
import { NetworkError } from "../../../../../utils/errors";

export type CgnCategoriesState = {
  selectedCategory: ProductCategoryEnum | undefined;
  list: RemoteValue<ReadonlyArray<ProductCategoryEnum>, NetworkError>;
};

const INITIAL_STATE: CgnCategoriesState = {
  selectedCategory: undefined,
  list: remoteUndefined
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
    // Categories List
    case getType(cgnCategories.request):
      return {
        ...state,
        list: remoteLoading
      };
    case getType(cgnCategories.success):
      return {
        ...state,
        list: remoteReady(action.payload)
      };
    case getType(cgnCategories.failure):
      return {
        ...state,
        list: remoteError(action.payload)
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

export const cgnCategoriesListSelector = createSelector(
  cgnCategoriesSelector,
  categories => categories.list
);
