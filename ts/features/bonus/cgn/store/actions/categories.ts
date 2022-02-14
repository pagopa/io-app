import { ActionType, createStandardAction } from "typesafe-actions";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";

export const cgnSelectedCategory = createStandardAction(
  "CGN_SELECTED_CATEGORY"
)<ProductCategoryEnum>();

export type CgnCategoriesActions = ActionType<typeof cgnSelectedCategory>;
