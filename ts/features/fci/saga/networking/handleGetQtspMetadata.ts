import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { fciLoadQtspClauses } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { FciClient } from "../../api/backendFci";
import { fciIssuerEnvironmentSelector } from "../../store/reducers/fciSignatureRequest";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetQtspMetadata(
  getQtspClausesMetadata: FciClient["getQtspClausesMetadata"],
  bearerToken: string,
  action: ActionType<(typeof fciLoadQtspClauses)["request"]>
): SagaIterator {
  try {
    const issuerEnvironment = yield* select(fciIssuerEnvironmentSelector);
    const getQtspClausesMetadataRequest = getQtspClausesMetadata({
      Bearer: `Bearer ${bearerToken}`,
      "x-iosign-issuer-environment": issuerEnvironment
    });
    const getQtspClausesMetadataResponse = (yield* call(
      withRefreshApiCall,
      getQtspClausesMetadataRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getQtspClausesMetadata>;

    if (E.isLeft(getQtspClausesMetadataResponse)) {
      throw Error(readablePrivacyReport(getQtspClausesMetadataResponse.left));
    }

    if (getQtspClausesMetadataResponse.right.status === 200) {
      yield* put(
        fciLoadQtspClauses.success(getQtspClausesMetadataResponse.right.value)
      );
      return;
    }

    if (getQtspClausesMetadataResponse.right.status === 401) {
      return;
    }

    throw Error(
      `response status ${getQtspClausesMetadataResponse.right.status}`
    );
  } catch (e) {
    yield* put(fciLoadQtspClauses.failure(getNetworkError(e)));
  }
}
