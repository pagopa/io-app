import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { ServicesClient } from "../../common/api/client";
import { featuredItemsGet } from "../store/actions";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";

/**
 * saga to handle the loading of featured items (services and/or institutions)
 * @param getFeaturedItems
 * @param action
 */
export function* handleGetFeaturedItems(
  getFeaturedItems: ServicesClient["getFeaturedItems"],
  action: ActionType<typeof featuredItemsGet.request>
) {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getFeaturedItems({}),
      action
    )) as unknown as SagaCallReturnType<typeof getFeaturedItems>;

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(featuredItemsGet.success(response.right.value));
        return;
      }

      // not handled error codes
      yield* put(
        featuredItemsGet.failure({
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      featuredItemsGet.failure({
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      featuredItemsGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
