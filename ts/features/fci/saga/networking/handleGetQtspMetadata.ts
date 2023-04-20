import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { fciLoadQtspClauses } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { SessionToken } from "../../../../types/SessionToken";
import { FciClient } from "../../api/backendFci";
import { fciIssuerEnvironmentSelector } from "../../store/reducers/fciSignatureRequest";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetQtspMetadata(
  getQtspClausesMetadata: FciClient["getQtspClausesMetadata"],
  bearerToken: SessionToken
): SagaIterator {
  try {
    const issuerEnvironment = yield* select(fciIssuerEnvironmentSelector);
    const getQtspClausesMetadataResponse = yield* call(getQtspClausesMetadata, {
      Bearer: `Bearer ${bearerToken}`,
      "x-iosign-issuer-environment": issuerEnvironment
    });

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
