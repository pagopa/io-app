import { SagaIterator } from "redux-saga";
import { ActionType } from "typesafe-actions";
import { call, take, takeLatest } from "typed-redux-saga/macro";
import { CommonActions } from "@react-navigation/native";
import { ReduxSagaEffect } from "../../../types/utils";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { BackendFciClient } from "../api/backendFci";
import {
  fciAbortingRequest,
  fciSignatureRequestFromId
} from "../store/actions/fciSignatureRequest";
import { handleGetSignatureRequestById } from "./networking/handleGetSignatureRequestById";

/**
 * Handle the FCI Signature requests
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

/**
 * Handle the FCI abort requests
 */
export function* watchFciAbortingSaga(): Iterator<ReduxSagaEffect> {
  yield* take(fciAbortingRequest);
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN)
  );
}
