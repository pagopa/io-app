import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PathTraversalSafePathParam } from "../../../../../definitions/backend/PathTraversalSafePathParam";
import { BackendClient } from "../../../../api/backend";
import { handleOrganizationNameUpdateSaga } from "../../../../sagas/services/handleOrganizationNameUpdateSaga";
import { handleServiceReadabilitySaga } from "../../../../sagas/services/handleServiceReadabilitySaga";
import { loadServiceDetailNotFound } from "../../../../store/actions/services";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { loadServiceDetail } from "../store/actions/details";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

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
        const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
        if (isFastLoginEnabled) {
          return;
        }
      }

      if (response.right.status === 200) {
        yield* put(loadServiceDetail.success(response.right.value));
        // If it is occurring during the first load of serivces,
        // mark the service as read (it will not display the badge on the list item)
        yield* call(handleServiceReadabilitySaga, action.payload);
        // Update, if needed, the name of the organization that provides the service
        yield* call(handleOrganizationNameUpdateSaga, response.right.value);

        return;
      }

      if (response.right.status === 404) {
        yield* put(
          loadServiceDetailNotFound(action.payload as unknown as ServiceId)
        );
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
