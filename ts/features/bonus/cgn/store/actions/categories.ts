import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { NetworkError } from "../../../../../utils/errors";

export const cgnSelectedCategory = createStandardAction(
  "CGN_SELECTED_CATEGORY"
)<ProductCategoryEnum>();

export const cgnCategories = createAsyncAction(
  "CGN_CATEGORIES_REQUEST",
  "CGN_CATEGORIES_SUCCESS",
  "CGN_CATEGORIES_FAILURE"
)<void, ReadonlyArray<ProductCategoryEnum>, NetworkError>();

export type CgnCategoriesActions =
  | ActionType<typeof cgnSelectedCategory>
  | ActionType<typeof cgnCategories>;
