import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PathTraversalSafePathParam } from "../../../../../definitions/backend/PathTraversalSafePathParam";
import { BackendClient } from "../../../../api/backend";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { loadServiceDetail } from "../store/actions/details";
import { readablePrivacyReport } from "../../../../utils/reporters";

/**
 * saga to handle the loading of a service detail
 * @param getService
 * @param action
 */
export function* handleServiceDetails(
  getService: BackendClient["getService"],
  action: ActionType<typeof loadServiceDetail.request>
) {
  try {
    if (!PathTraversalSafePathParam.is(action.payload)) {
      yield* put(
        loadServiceDetail.failure({
          service_id: action.payload,
          error: new Error(
            "Unable to decode ServiceId to PathTraversalSafePathParam"
          )
        })
      );
      return;
    }

    const response = (yield* call(
      withRefreshApiCall,
      getService({
        service_id: action.payload
      }),
      action
    )) as unknown as SagaCallReturnType<typeof getService>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }

      if (response.right.status === 200) {
        yield* put(loadServiceDetail.success(response.right.value));
        return;
      }
      // not handled error codes
      yield* put(
        loadServiceDetail.failure({
          service_id: action.payload,
          error: new Error(`response status ${response.right.status}`)
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      loadServiceDetail.failure({
        service_id: action.payload,
        error: new Error(readablePrivacyReport(response.left))
      })
    );
  } catch (e) {
    yield* put(
      loadServiceDetail.failure({
        service_id: action.payload,
        error: convertUnknownToError(e)
      })
    );
  }
}
