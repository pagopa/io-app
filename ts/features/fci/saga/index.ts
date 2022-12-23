import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { SagaIterator } from "redux-saga";
import { getType, ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import {
  call,
  takeLatest,
  put,
  select,
  take,
  delay
} from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import { FCI_ROUTES } from "../navigation/routes";
import ROUTES from "../../../navigation/routes";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { BackendFciClient } from "../api/backendFci";
import {
  identificationRequest,
  identificationSuccess
} from "../../../store/actions/identification";
import I18n from "../../../i18n";
import {
  fciSignatureRequestSelector,
  FciSignatureRequestState
} from "../store/reducers/fciSignatureRequest";
import { fciQtspFilledDocumentUrlSelector } from "../store/reducers/fciQtspFilledDocument";
import { CreateSignatureBody } from "../../../../definitions/fci/CreateSignatureBody";
import {
  fciSignatureRequestFromId,
  fciClearStateRequest,
  fciStartRequest,
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciDownloadPreview,
  fciDownloadPreviewClear,
  fciStartSigningRequest,
  fciSigningRequest,
  fciEndRequest,
  fciShowSignedDocumentsStartRequest,
  fciShowSignedDocumentsEndRequest,
  fciPollFilledDocument
} from "../store/actions";
import {
  fciQtspClausesMetadataSelector,
  FciQtspClausesState,
  fciQtspNonceSelector
} from "../store/reducers/fciQtspClauses";
import { fciDocumentSignaturesSelector } from "../store/reducers/fciDocumentSignatures";
import {
  fciPollRetryTimesSelector,
  MAX_POLLING_RETRY,
  POLLING_FREQ_TIMEOUT
} from "../store/reducers/fciPollFilledDocument";
import { getNetworkError } from "../../../utils/errors";
import { handleGetSignatureRequestById } from "./networking/handleGetSignatureRequestById";
import { handleGetQtspMetadata } from "./networking/handleGetQtspMetadata";
import { handleCreateFilledDocument } from "./networking/handleCreateFilledDocument";
import { handleDownloadDocument } from "./networking/handleDownloadDocument";
import { handleCreateSignature } from "./networking/handleCreateSignature";

/**
 * Handle the FCI Signature requests
 * @param bearerToken
 */
export function* watchFciSaga(bearerToken: SessionToken): SagaIterator {
  const fciClient = BackendFciClient(apiUrlPrefix, bearerToken);

  // handle the request of getting FCI signatureRequestDetails
  yield* takeLatest(
    getType(fciSignatureRequestFromId.request),
    handleGetSignatureRequestById,
    fciClient.getSignatureDetailViewById
  );

  // handle the request of getting QTSP metadata
  yield* takeLatest(
    getType(fciLoadQtspClauses.request),
    handleGetQtspMetadata,
    fciClient.getQtspClausesMetadata
  );

  // handle the request of getting QTSP filled_document
  yield* takeLatest(
    getType(fciLoadQtspFilledDocument.request),
    handleCreateFilledDocument,
    fciClient.postQtspFilledBody
  );

  yield* takeLatest(getType(fciStartRequest), watchFciStartSaga);

  yield* takeLatest(
    getType(fciLoadQtspClauses.success),
    watchFciQtspClausesSaga
  );

  // handle the request to get the document file from url
  yield* takeLatest(
    getType(fciDownloadPreview.request),
    handleDownloadDocument
  );

  yield* takeLatest(getType(fciDownloadPreviewClear), clearFciDownloadPreview);

  yield* takeLatest(
    getType(fciStartSigningRequest),
    watchFciSigningRequestSaga
  );

  // handle the request to create the signature
  yield* takeLatest(
    getType(fciSigningRequest.request),
    handleCreateSignature,
    fciClient.postSignature
  );

  yield* takeLatest(
    getType(fciShowSignedDocumentsStartRequest),
    watchFciSignedDocumentsStartSaga
  );

  yield* takeLatest(
    getType(fciShowSignedDocumentsEndRequest),
    watchFciSignedDocumentsEndSaga
  );

  yield* takeLatest(getType(fciEndRequest), watchFciEndSaga);

  yield* takeLatest(getType(fciPollFilledDocument.request), watchFciPollSaga);
}

/**
 * Handle the FCI requests to get the QTSP filled_document
 */
function* watchFciQtspClausesSaga(): SagaIterator {
  const potQtspClauses: FciQtspClausesState = yield* select(
    fciQtspClausesMetadataSelector
  );

  if (pot.isSome(potQtspClauses)) {
    const documentUrl = Buffer.from(
      `${potQtspClauses.value.document_url}`
    ).toString("base64");
    yield* put(
      fciLoadQtspFilledDocument.request({
        document_url: documentUrl as NonEmptyString
      })
    );
  } else {
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.navigate(ROUTES.MAIN, {
        screen: ROUTES.WORKUNIT_GENERIC_FAILURE
      })
    );
  }
}
/**
 * Handle the FCI start requests saga
 */
function* watchFciStartSaga(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
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

/**
 * Clears cached file for the fci document preview
 * and reset the state to empty.
 */
function* clearFciDownloadPreview(
  action: ActionType<typeof fciDownloadPreviewClear>
) {
  const path = action.payload.path;
  if (path) {
    yield RNFS.exists(path).then(exists =>
      exists ? RNFS.unlink(path) : Promise.resolve()
    );
  }
  yield* put(fciDownloadPreview.cancel());
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.goBack()
  );
}

/**
 * Handle the FCI start signing saga
 */
function* watchFciSigningRequestSaga(): SagaIterator {
  yield* put(
    identificationRequest(false, true, undefined, {
      label: I18n.t("global.buttons.cancel"),
      onCancel: () => undefined
    })
  );
  const res = yield* take(identificationSuccess);
  if (res.type === "IDENTIFICATION_SUCCESS") {
    const potQtspClauses: FciQtspClausesState = yield* select(
      fciQtspClausesMetadataSelector
    );
    const potSignatureRequest: FciSignatureRequestState = yield* select(
      fciSignatureRequestSelector
    );
    const qtspFilledDocumentUrl = yield* select(
      fciQtspFilledDocumentUrlSelector
    );
    const qtspNonce = yield* select(fciQtspNonceSelector);
    const documentSignatures = yield* select(fciDocumentSignaturesSelector);

    if (
      pot.isSome(potQtspClauses) &&
      pot.isSome(potSignatureRequest) &&
      qtspFilledDocumentUrl &&
      qtspNonce
    ) {
      const createSignaturePayload: CreateSignatureBody = {
        signature_request_id: potSignatureRequest.value.id,
        documents_to_sign: documentSignatures,
        qtsp_clauses: {
          accepted_clauses: potQtspClauses.value.clauses,
          filled_document_url: Buffer.from(`${qtspFilledDocumentUrl}`).toString(
            "base64"
          ) as NonEmptyString,
          nonce: qtspNonce as NonEmptyString
        }
      };

      yield* put(fciSigningRequest.request(createSignaturePayload));
    }

    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.TYP
      })
    );
  }
}

function* watchFciSignedDocumentsStartSaga(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.replace(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.DOC_PREVIEW,
      params: {
        documentUrl: ""
      }
    })
  );
}

function* watchFciSignedDocumentsEndSaga(): SagaIterator {
  yield* put(fciClearStateRequest());
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.goBack()
  );
}

/**
 * Handle the FCI abort requests saga
 */
function* watchFciEndSaga(): SagaIterator {
  yield* put(fciClearStateRequest());
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN)
  );
}

/**
 * Handle the FCI polling saga
 * This saga is used to poll the QTSP filled_document to check if the
 * document is ready to be downloaded by the user. The polling is done
 * every POLLING_FREQ_TIMEOUT seconds and the polling is stopped when
 * the document is ready or when the polling is retried
 * MAX_POLLING_RETRY times.
 */
function* watchFciPollSaga(): SagaIterator {
  const qtspFilledDocumentUrl = yield* select(fciQtspFilledDocumentUrlSelector);
  const pollRetryTimes = yield* select(fciPollRetryTimesSelector);
  if (qtspFilledDocumentUrl) {
    try {
      const response = yield* call(fetch, qtspFilledDocumentUrl);
      const responseStatus = response.status;
      if (responseStatus === 200) {
        yield* put(
          fciPollFilledDocument.success({
            isReady: true,
            retryTimes: pollRetryTimes
          })
        );
      } else if (pollRetryTimes < MAX_POLLING_RETRY) {
        yield* put(
          fciPollFilledDocument.success({
            isReady: false,
            retryTimes: pollRetryTimes + 1
          })
        );
        yield* delay(POLLING_FREQ_TIMEOUT);
        yield* put(fciPollFilledDocument.request());
      }
    } catch (e) {
      yield* put(fciPollFilledDocument.failure(getNetworkError(e)));
    }
  }
}
