import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { PublishedProductCategories } from "../../../../../../../definitions/cgn/merchants/PublishedProductCategories";
import { PublishedProductCategoriesWithNewDiscountsCount } from "../../../../../../../definitions/cgn/merchants/PublishedProductCategoriesWithNewDiscountsCount";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";
import { cgnCategories } from "../../../store/actions/categories";

const checkIsCategoriesWithCount = (
  cl:
    | PublishedProductCategoriesWithNewDiscountsCount
    | PublishedProductCategories
): cl is PublishedProductCategoriesWithNewDiscountsCount =>
  PublishedProductCategoriesWithNewDiscountsCount.is(cl);

// Saga aimed to call the API to retrieve the CGN benefits categories available
export function* cgnCategoriesSaga(
  getPublishedCategories: ReturnType<
    typeof BackendCgnMerchants
  >["getPublishedCategories"]
) {
  try {
    const publishedCategoriesResult: SagaCallReturnType<
      typeof getPublishedCategories
    > = yield* call(getPublishedCategories, { count_new_discounts: true });
    if (E.isLeft(publishedCategoriesResult)) {
      yield* put(
        cgnCategories.failure(
          getGenericError(
            new Error(readableReport(publishedCategoriesResult.left))
          )
        )
      );
      return;
    }

    if (publishedCategoriesResult.right.status === 200) {
      const apiResult = publishedCategoriesResult.right.value;
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
      `Response in status ${publishedCategoriesResult.right.status}`
    );
  } catch (e) {
    yield* put(cgnCategories.failure(getNetworkError(e)));
  }
}
