import * as pot from "@pagopa/ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { ActionType } from "typesafe-actions";
import {
  call,
  fork,
  take,
  takeLatest,
  put,
  select
} from "typed-redux-saga/macro";
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
  fciAbortRequest,
  fciStartRequest,
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument
} from "../store/actions";
import {
  fciQtspClausesSelector,
  FciQtspClausesState
} from "../store/reducers/fciQtspClauses";
import { handleGetSignatureRequestById } from "./networking/handleGetSignatureRequestById";
import { handleGetQtspMetadata } from "./networking/handleGetQtspMetadata";
import { handleCreateFilledDocument } from "./networking/handleCreateFilledDocument";

/**
 * Handle the FCI Signature requests
 * @param bearerToken
 */
export function* watchFciSaga(bearerToken: SessionToken): SagaIterator {
  const fciClient = BackendFciClient(apiUrlPrefix, bearerToken);

  // handle the request of getting FCI signatureRequestDetails
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

  // handle the request of getting QTSP metadata
  yield* takeLatest(fciLoadQtspClauses.request, function* () {
    yield* call(handleGetQtspMetadata, fciClient.getQtspClausesMetadata);
  });

  yield* takeLatest(
    fciLoadQtspFilledDocument.request,
    function* (action: ActionType<typeof fciLoadQtspFilledDocument.request>) {
      yield* call(
        handleCreateFilledDocument,
        fciClient.postQtspFilledBody,
        action
      );
    }
  );

  yield* fork(watchFciQtspClausesSaga);

  yield* fork(watchFciStartSaga);

  yield* fork(watchFciAbortSaga);
}

function* watchFciQtspClausesSaga(): Iterator<ReduxSagaEffect> {
  while (true) {
    yield* take(fciLoadQtspClauses.success);
    const potQtspClauses: FciQtspClausesState = yield* select(
      fciQtspClausesSelector
    );

    if (pot.isSome(potQtspClauses)) {
      const documentUrl = potQtspClauses.value.document_url;
      yield* put(
        fciLoadQtspFilledDocument.request({ document_url: documentUrl })
      );
    }
  }
}

/**
 * Handle the FCI abort requests
 */
function* watchFciAbortSaga(): Iterator<ReduxSagaEffect> {
  while (true) {
    yield* take(fciAbortRequest);
    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(ROUTES.MAIN)
    );
  }
}

/**
 * Handle the FCI start requests
 */
function* watchFciStartSaga(): Iterator<ReduxSagaEffect> {
  while (true) {
    yield* take(fciStartRequest);
    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.DOCUMENTS
      })
    );
    // when the user start signing flow
    // start a request to get the QTSP metadata
    // this is needed to get the document_url
    // that will be used to create the filled document
    yield* put(fciLoadQtspClauses.request());
  }
}
