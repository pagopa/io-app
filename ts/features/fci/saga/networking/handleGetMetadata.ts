import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { FciClient } from "../../api/backendFci";
import { fciMetadataRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { SessionToken } from "../../../../types/SessionToken";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetMetadata(
  getMetadata: FciClient["getMetadata"],
  bearerToken: SessionToken
): SagaIterator {
  try {
    const getMetadataResponse = yield* call(getMetadata, {
      Bearer: `Bearer ${bearerToken}`
    });

    if (E.isLeft(getMetadataResponse)) {
      throw Error(readablePrivacyReport(getMetadataResponse.left));
    }

    if (getMetadataResponse.right.status === 200) {
      yield* put(fciMetadataRequest.success(getMetadataResponse.right.value));
      return;
    }

    throw Error(`response status ${getMetadataResponse.right.status}`);
  } catch (e) {
    yield* put(fciMetadataRequest.failure(getNetworkError(e)));
  }
}
