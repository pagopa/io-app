import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../common/api/servicesClient";
import { featuredInstitutionsGet } from "../store/actions";

/**
 * saga to handle the loading of featured institutions
 * @param getFeaturedInstitutions
 * @param action
 */
export function* handleGetFeaturedInstitutions(
  getFeaturedInstitutions: ServicesClient["getFeaturedInstitutions"],
  action: ActionType<typeof featuredInstitutionsGet.request>
) {
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getFeaturedInstitutions({}),
      action
    )) as unknown as SagaCallReturnType<typeof getFeaturedInstitutions>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }

      if (response.right.status === 200) {
        yield* put(featuredInstitutionsGet.success(response.right.value));
        return;
      }

      // not handled error codes
      yield* put(
        featuredInstitutionsGet.failure({
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      featuredInstitutionsGet.failure({
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      featuredInstitutionsGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
