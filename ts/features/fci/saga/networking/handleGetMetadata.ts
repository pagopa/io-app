import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { FciClient } from "../../api/backendFci";
import { fciMetadataRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";

/*
 * A saga to load a QTSP metadata.
 */
export function* handleGetMetadata(
  getMetadata: FciClient["getMetadata"],
  bearerToken: string,
  action: ActionType<(typeof fciMetadataRequest)["request"]>
): SagaIterator {
  try {
    const getMetadataRequest = getMetadata({
      Bearer: `Bearer ${bearerToken}`
    });
    const getMetadataResponse = (yield* call(
      withRefreshApiCall,
      getMetadataRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getMetadata>;

    if (E.isLeft(getMetadataResponse)) {
      throw Error(readablePrivacyReport(getMetadataResponse.left));
    }

    if (getMetadataResponse.right.status === 200) {
      yield* put(fciMetadataRequest.success(getMetadataResponse.right.value));
      return;
    }

    if (getMetadataResponse.right.status === 401) {
      return;
    }

    throw Error(`response status ${getMetadataResponse.right.status}`);
  } catch (e) {
    yield* put(fciMetadataRequest.failure(getNetworkError(e)));
  }
}
