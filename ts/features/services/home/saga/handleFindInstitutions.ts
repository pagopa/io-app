import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../common/api/servicesClient";
import { paginatedInstitutionsGet } from "../store/actions";

/**
 * saga to handle the loading of institutions
 * @param findInstitutions
 * @param action
 */
export function* handleFindInstitutions(
  findInstitutions: ServicesClient["findInstitutions"],
  action: ActionType<typeof paginatedInstitutionsGet.request>
) {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      findInstitutions(action.payload),
      action
    )) as unknown as SagaCallReturnType<typeof findInstitutions>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }

      if (response.right.status === 200) {
        yield* put(paginatedInstitutionsGet.success(response.right.value));
        return;
      }

      // not handled error codes
      yield* put(
        paginatedInstitutionsGet.failure({
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      paginatedInstitutionsGet.failure({
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      paginatedInstitutionsGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
