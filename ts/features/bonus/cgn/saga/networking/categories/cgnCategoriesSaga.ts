import { delay, put } from "redux-saga/effects";
import { cgnCategories } from "../../../store/actions/categories";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";

// Saga aimed to call the API to retrieve the CGN benefits categories available
// TODO Implement networking logic once API client is defined
export function* cgnCategoriesSaga(_: unknown) {
  const categories = Object.entries(ProductCategoryEnum).map(value => value[1]);
  yield delay(300);
  yield put(cgnCategories.success(categories));
}
