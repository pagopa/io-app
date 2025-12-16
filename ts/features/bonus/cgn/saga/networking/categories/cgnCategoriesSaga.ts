import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
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
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";

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
  >["getPublishedCategories"],
  action: ActionType<(typeof cgnCategories)["request"]>
) {
  try {
    const publishedCategoriesRequest = getPublishedCategories({
      count_new_discounts: true
    });
    const publishedCategoriesResult = (yield* call(
      withRefreshApiCall,
      publishedCategoriesRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getPublishedCategories>;
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
    }

    if (publishedCategoriesResult.right.status === 401) {
      return;
    }

    throw new Error(
      `Response in status ${publishedCategoriesResult.right.status}`
    );
  } catch (e) {
    yield* put(cgnCategories.failure(getNetworkError(e)));
  }
}
