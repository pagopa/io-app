import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { FciClient } from "../../api/backendFci";
import { fciSignaturesListRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetSignatureRequests(
  getSignatureRequests: FciClient["getSignatureRequests"],
  bearerToken: string,
  action: ActionType<(typeof fciSignaturesListRequest)["request"]>
): SagaIterator {
  try {
    const getSignatureRequestsCall = getSignatureRequests({
      Bearer: `Bearer ${bearerToken}`
    });

    const getSignatureRequestsResponse = (yield* call(
      withRefreshApiCall,
      getSignatureRequestsCall,
      action
    )) as unknown as SagaCallReturnType<typeof getSignatureRequests>;

    if (E.isLeft(getSignatureRequestsResponse)) {
      throw Error(readablePrivacyReport(getSignatureRequestsResponse.left));
    }

    if (getSignatureRequestsResponse.right.status === 200) {
      yield* put(
        fciSignaturesListRequest.success(
          getSignatureRequestsResponse.right.value
        )
      );
      return;
    }

    if (getSignatureRequestsResponse.right.status === 401) {
      return;
    }

    throw Error(`response status ${getSignatureRequestsResponse.right.status}`);
  } catch (e) {
    yield* put(fciSignaturesListRequest.failure(getNetworkError(e)));
  }
}
