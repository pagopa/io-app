import { SagaIterator } from "redux-saga";
import { ActionType } from "typesafe-actions";
import { call, fork, take, takeLatest } from "typed-redux-saga/macro";
import { CommonActions } from "@react-navigation/native";
import { ReduxSagaEffect } from "../../../types/utils";
import NavigationService from "../../../navigation/NavigationService";
import { FCI_ROUTES } from "../navigation/routes";
import ROUTES from "../../../navigation/routes";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { BackendFciClient } from "../api/backendFci";
import {
  fciSignatureRequestFromId,
  fciAbortingRequest,
  fciStartingRequest
} from "../store/actions";
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

  yield* fork(watchFciStartingSaga);

  yield* fork(watchFciAbortingSaga);
}

/**
 * Handle the FCI abort requests
 */
function* watchFciAbortingSaga(): Iterator<ReduxSagaEffect> {
  while (true) {
    yield* take(fciAbortingRequest);
    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(ROUTES.MAIN)
    );
  }
}

/**
 * Handle the FCI start requests
 */
function* watchFciStartingSaga(): Iterator<ReduxSagaEffect> {
  while (true) {
    yield* take(fciStartingRequest);
    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.DOCUMENTS
      })
    );
  }
}
