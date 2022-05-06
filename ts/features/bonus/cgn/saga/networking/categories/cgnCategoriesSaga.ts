import { call, put } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { cgnCategories } from "../../../store/actions/categories";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { PublishedProductCategoriesWithNewDiscountsCount } from "../../../../../../../definitions/cgn/merchants/PublishedProductCategoriesWithNewDiscountsCount";
import { PublishedProductCategories } from "../../../../../../../definitions/cgn/merchants/PublishedProductCategories";

const checkIsCategoriesWithCount = (
  cl:
    | PublishedProductCategoriesWithNewDiscountsCount
    | PublishedProductCategories
): cl is PublishedProductCategoriesWithNewDiscountsCount =>
  PublishedProductCategoriesWithNewDiscountsCount.decode(cl).isRight();

// Saga aimed to call the API to retrieve the CGN benefits categories available
export function* cgnCategoriesSaga(
  getPublishedCategories: ReturnType<
    typeof BackendCgnMerchants
  >["getPublishedCategories"]
) {
  try {
    const publishedCategoriesResult: SagaCallReturnType<
      typeof getPublishedCategories
    > = yield* call(getPublishedCategories, { countNewDiscounts: true });
    if (publishedCategoriesResult.isLeft()) {
      yield* put(
        cgnCategories.failure(
          getGenericError(
            new Error(readableReport(publishedCategoriesResult.value))
          )
        )
      );
      return;
    }

    if (publishedCategoriesResult.value.status === 200) {
      const apiResult = publishedCategoriesResult.value.value;
      if (checkIsCategoriesWithCount(apiResult)) {
        yield* put(cgnCategories.success(apiResult.items));
        return;
      }
      throw new Error(
        `Expected a ProductCategoryWithNewDiscountsCount but received PublishedProductCategories`
      );
      return;
    }

    throw new Error(
      `Response in status ${publishedCategoriesResult.value.status}`
    );
  } catch (e) {
    yield* put(cgnCategories.failure(getNetworkError(e)));
  }
}
