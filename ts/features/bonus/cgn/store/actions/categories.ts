import { ActionType, createAsyncAction } from "typesafe-actions";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { NetworkError } from "../../../../../utils/errors";

export const cgnCategories = createAsyncAction(
  "CGN_CATEGORIES_REQUEST",
  "CGN_CATEGORIES_SUCCESS",
  "CGN_CATEGORIES_FAILURE"
)<void, ReadonlyArray<ProductCategoryWithNewDiscountsCount>, NetworkError>();

export type CgnCategoriesActions = ActionType<typeof cgnCategories>;
