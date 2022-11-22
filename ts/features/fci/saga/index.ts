import { SagaIterator } from "redux-saga";
import { ActionType } from "typesafe-actions";
import { call, takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { BackendFciClient } from "../api/backendFci";
import { fciSignatureRequestFromId } from "../store/actions";
import { handleGetSignatureRequestById } from "./networking/handleGetSignatureRequestById";

/**
 * Handle the SignWithIO requests
 * @param bearerToken
 */
export function* watchFciSaga(bearerToken: SessionToken): SagaIterator {
  const fciClient = BackendFciClient(apiUrlPrefix, bearerToken);

  // handle the request of getting SignWithIO products
  yield* takeLatest(
    fciSignatureRequestFromId.request,
    function* (action: ActionType<typeof fciSignatureRequestFromId.request>) {
      yield* call(
        handleGetSignatureRequestById,
        fciClient.getSignatureDetailViewById,
        action
      );
    }
  );
}
