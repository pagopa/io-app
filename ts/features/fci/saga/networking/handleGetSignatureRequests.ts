import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { FciClient } from "../../api/backendFci";
import { fciSignaturesListRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { SessionToken } from "../../../../types/SessionToken";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetSignatureRequests(
  getSignatureRequests: FciClient["getSignatureRequests"],
  bearerToken: SessionToken
): SagaIterator {
  try {
    const getSignatureRequestsResponse = yield* call(getSignatureRequests, {
      Bearer: `Bearer ${bearerToken}`
    });

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

    throw Error(`response status ${getSignatureRequestsResponse.right.status}`);
  } catch (e) {
    yield* put(fciSignaturesListRequest.failure(getNetworkError(e)));
  }
}
