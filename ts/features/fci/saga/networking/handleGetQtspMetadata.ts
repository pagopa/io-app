import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendFciClient } from "../../api/backendFci";
import { fciLoadQtspClauses } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetQtspMetadata(
  getQtspClausesMetadata: ReturnType<
    typeof BackendFciClient
  >["getQtspClausesMetadata"]
): SagaIterator {
  try {
    const getQtspClausesMetadataResponse = yield* call(
      getQtspClausesMetadata,
      {}
    );

    if (E.isLeft(getQtspClausesMetadataResponse)) {
      throw Error(readablePrivacyReport(getQtspClausesMetadataResponse.left));
    }

    if (getQtspClausesMetadataResponse.right.status === 200) {
      yield* put(
        fciLoadQtspClauses.success(getQtspClausesMetadataResponse.right.value)
      );
      return;
    }

    throw Error(
      `response status ${getQtspClausesMetadataResponse.right.status}`
    );
  } catch (e) {
    yield* put(fciLoadQtspClauses.failure(getNetworkError(e)));
  }
}
