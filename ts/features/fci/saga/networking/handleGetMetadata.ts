import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendFciClient } from "../../api/backendFci";
import { fciMetadataRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetMetadata(
  getMetadata: ReturnType<typeof BackendFciClient>["getMetadata"]
): SagaIterator {
  try {
    const getMetadataResponse = yield* call(getMetadata, {});

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
