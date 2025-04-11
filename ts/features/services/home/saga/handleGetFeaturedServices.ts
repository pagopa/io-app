import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../common/api/servicesClient";
import { featuredServicesGet } from "../store/actions";

/**
 * saga to handle the loading of featured services
 * @param getFeaturedServices
 * @param action
 */
export function* handleGetFeaturedServices(
  getFeaturedServices: ServicesClient["getFeaturedServices"],
  action: ActionType<typeof featuredServicesGet.request>
) {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getFeaturedServices({}),
      action
    )) as unknown as SagaCallReturnType<typeof getFeaturedServices>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }

      if (response.right.status === 200) {
        yield* put(featuredServicesGet.success(response.right.value));
        return;
      }

      // not handled error codes
      yield* put(
        featuredServicesGet.failure({
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      featuredServicesGet.failure({
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      featuredServicesGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
