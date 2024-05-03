import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { ServicesClient } from "../../common/api/client";
import { paginatedServicesGet } from "../store/actions";

/**
 * saga to handle the loading of services
 * @param findInstutionServices
 * @param action
 */
export function* handleFindServices(
  findInstutionServices: ServicesClient["findInstutionServices"],
  action: ActionType<typeof paginatedServicesGet.request>
) {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      findInstutionServices(action.payload),
      action
    )) as unknown as SagaCallReturnType<typeof findInstutionServices>;

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(paginatedServicesGet.success(response.right.value));
        return;
      }

      // not handled error codes
      yield* put(
        paginatedServicesGet.failure({
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      paginatedServicesGet.failure({
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      paginatedServicesGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
