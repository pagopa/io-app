import { call, put } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { cgnCategories } from "../../../store/actions/categories";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { BackendCgnMerchants } from "../../../api/backendCgnMerchants";

// Saga aimed to call the API to retrieve the CGN benefits categories available
export function* cgnCategoriesSaga(
  getPublishedCategories: ReturnType<
    typeof BackendCgnMerchants
  >["getPublishedCategories"]
) {
  try {
    const publishedCategoriesResult: SagaCallReturnType<
      typeof getPublishedCategories
    > = yield* call(getPublishedCategories, {});
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
      yield* put(
        cgnCategories.success(publishedCategoriesResult.value.value.items)
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
