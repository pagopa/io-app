import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ContentClient } from "../../../../../../api/content";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { loadPrivativeIssuers } from "../../store/actions";

/**
 * Load Privative Issuers configuration
 */
export function* handleLoadPrivativeConfiguration(
  getPrivativeServices: ReturnType<
    typeof ContentClient
  >["getPrivativeServices"],
  _: ActionType<typeof loadPrivativeIssuers.request>
) {
  try {
    const getPrivativeServicesResult: SagaCallReturnType<
      typeof getPrivativeServices
    > = yield* call(getPrivativeServices);
    if (E.isRight(getPrivativeServicesResult)) {
      if (getPrivativeServicesResult.right.status === 200) {
        yield* put(
          loadPrivativeIssuers.success(getPrivativeServicesResult.right.value)
        );
      } else {
        throw new Error(
          `response status ${getPrivativeServicesResult.right.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getPrivativeServicesResult.left));
    }
  } catch (e) {
    yield* put(loadPrivativeIssuers.failure(getNetworkError(e)));
  }
}
