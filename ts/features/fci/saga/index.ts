import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { SagaIterator } from "redux-saga";
import { ActionType, isActionOf } from "typesafe-actions";
import RNFS from "react-native-fs";
import { call, takeLatest, put, select, take } from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import { FCI_ROUTES } from "../navigation/routes";
import ROUTES from "../../../navigation/routes";
import { apiUrlPrefix } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import {
  identificationPinReset,
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
  fciClearAllFiles,
  fciMetadataRequest,
  fciSignaturesListRequest,
  fciDocumentSignatureFields
} from "../store/actions";
import {
  fciQtspClausesMetadataSelector,
  FciQtspClausesState,
  fciQtspNonceSelector
} from "../store/reducers/fciQtspClauses";
import { fciDocumentSignaturesSelector } from "../store/reducers/fciDocumentSignatures";
import { KeyInfo } from "../../lollipop/utils/crypto";
import { createFciClient } from "../api/backendFci";
import { handleGetSignatureRequestById } from "./networking/handleGetSignatureRequestById";
import { handleGetQtspMetadata } from "./networking/handleGetQtspMetadata";
import { handleCreateFilledDocument } from "./networking/handleCreateFilledDocument";
import {
  FciDownloadPreviewDirectoryPath,
  handleDownloadDocument
} from "./networking/handleDownloadDocument";
import { handleCreateSignature } from "./networking/handleCreateSignature";
import { handleGetMetadata } from "./networking/handleGetMetadata";
import { handleGetSignatureRequests } from "./networking/handleGetSignatureRequests";
import { handleDrawSignatureBox } from "./handleDrawSignatureBox";

/**
 * Handle the FCI Signature requests
 * @param bearerToken
 */
export function* watchFciSaga(
  bearerToken: SessionToken,
  keyInfo: KeyInfo
): SagaIterator {
  const fciGeneratedClient = createFciClient(apiUrlPrefix);

  // handle the request of getting FCI signatureRequestDetails
  yield* takeLatest(
    fciSignatureRequestFromId.request,
    handleGetSignatureRequestById,
    fciGeneratedClient.getSignatureRequestById,
    bearerToken
  );

  // handle the request of getting QTSP metadata
  yield* takeLatest(
    fciLoadQtspClauses.request,
    handleGetQtspMetadata,
    fciGeneratedClient.getQtspClausesMetadata,
    bearerToken
  );

  // handle the request of getting QTSP filled_document
  yield* takeLatest(
    fciLoadQtspFilledDocument.request,
    handleCreateFilledDocument,
    fciGeneratedClient.createFilledDocument,
    bearerToken
  );

  yield* takeLatest(fciStartRequest, watchFciStartSaga);

  yield* takeLatest(fciLoadQtspClauses.success, watchFciQtspClausesSaga);

  // handle the request to get the document file from url
  yield* takeLatest(fciDownloadPreview.request, handleDownloadDocument);

  yield* takeLatest(fciDownloadPreviewClear, clearFciDownloadPreview);

  yield* takeLatest(fciStartSigningRequest, watchFciSigningRequestSaga);

  // handle the request to create the signature
  yield* takeLatest(
    fciSigningRequest.request,
    handleCreateSignature,
    apiUrlPrefix,
    bearerToken,
    keyInfo
  );

  yield* takeLatest(fciEndRequest, watchFciEndSaga);

  yield* takeLatest(fciClearAllFiles, clearAllFciFiles);

  yield* takeLatest(
    fciMetadataRequest.request,
    handleGetMetadata,
    fciGeneratedClient.getMetadata,
    bearerToken
  );

  yield* takeLatest(
    fciSignaturesListRequest.request,
    handleGetSignatureRequests,
    fciGeneratedClient.getSignatureRequests,
    bearerToken
  );

  yield* takeLatest(fciDocumentSignatureFields.request, handleDrawSignatureBox);

  yield* takeLatest(identificationPinReset, watchIdentificationPinResetSaga);
}

/**
 * Handle the identification pin reset to clear fci state
 */
function* watchIdentificationPinResetSaga(): SagaIterator {
  yield* put(fciClearStateRequest());
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
    StackActions.replace(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.DOCUMENTS,
      params: {
        attrs: undefined
      }
    })
  );
  // when the user start signing flow
  // start a request to get the QTSP metadata
  // this is needed to get the document_url
  // that will be used to create the filled document
  yield* put(fciLoadQtspClauses.request());

  // start a request to get the metadata
  // this is needed to get the service_id
  yield* put(fciMetadataRequest.request());
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
    yield* deletePath(path);
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

  if (isActionOf(identificationSuccess, res)) {
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

function* deletePath(path: string) {
  yield RNFS.exists(path).then(exists =>
    exists ? RNFS.unlink(path) : Promise.resolve()
  );
}

/**
 * Clears cached file for the fci document preview
 * and reset the state to empty.
 */
function* clearAllFciFiles(action: ActionType<typeof fciClearAllFiles>) {
  yield* deletePath(action.payload.path);
}

/**
 * Handle the FCI abort requests saga
 */
function* watchFciEndSaga(): SagaIterator {
  yield* put(fciClearStateRequest());
  yield* put(fciClearAllFiles({ path: FciDownloadPreviewDirectoryPath }));
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ROUTES.MAIN)
  );
}
