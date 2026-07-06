import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CommonActions, StackActions } from "@react-navigation/native";
import I18n from "i18next";
import RNFS from "react-native-fs";
import { SagaIterator } from "redux-saga";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";

import { CreateSignatureBody } from "../../../../definitions/fci/CreateSignatureBody";
import { apiUrlPrefix } from "../../../config";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { isTestEnv } from "../../../utils/environment";
import { setActiveSessionLoginFlow } from "../../authentication/activeSessionLogin/store/actions";
import { activeSessionLoginFlowSelector } from "../../authentication/activeSessionLogin/store/selectors";
import { spidLevelFromSessionInfoSelector } from "../../authentication/common/store/selectors";
import {
  identificationPinReset,
  identificationRequest,
  identificationSuccess
} from "../../identification/store/actions";
import { KeyInfo } from "../../lollipop/utils/crypto";
import { createFciClient } from "../api/backendFci";
import { FCI_ROUTES } from "../navigation/routes";
import {
  fciClearAllFiles,
  fciClearStateRequest,
  fciDocumentSignatureFields,
  fciDownloadPreview,
  fciDownloadPreviewClear,
  fciEndRequest,
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciMetadataRequest,
  fciSignatureRequestFromId,
  fciSignatureRequestRetryFromId,
  fciSignaturesListRequest,
  fciSigningRequest,
  fciStartRequest,
  fciStartSigningRequest
} from "../store/actions";
import { fciDocumentSignaturesSelector } from "../store/reducers/fciDocumentSignatures";
import {
  fciQtspClausesMetadataSelector,
  FciQtspClausesState,
  fciQtspNonceSelector
} from "../store/reducers/fciQtspClauses";
import { fciQtspFilledDocumentUrlSelector } from "../store/reducers/fciQtspFilledDocument";
import {
  fciSignatureRequestIdSelector,
  fciSignatureRequestSelector,
  FciSignatureRequestState
} from "../store/reducers/fciSignatureRequest";
import { isFciSecurityLevelCheckRemoteFFEnabledSelector } from "../store/selectors/remoteConfig";
import { handleDrawSignatureBox } from "./handleDrawSignatureBox";
import { handleCreateFilledDocument } from "./networking/handleCreateFilledDocument";
import { handleCreateSignature } from "./networking/handleCreateSignature";
import {
  FciDownloadPreviewDirectoryPath,
  handleDownloadDocument
} from "./networking/handleDownloadDocument";
import { handleGetMetadata } from "./networking/handleGetMetadata";
import { handleGetQtspMetadata } from "./networking/handleGetQtspMetadata";
import { handleGetSignatureRequestById } from "./networking/handleGetSignatureRequestById";
import { handleGetSignatureRequests } from "./networking/handleGetSignatureRequests";

export function* navigateAfterFinishedFciActiveSessionLoginFlowSaga(
  isActiveLoginSuccessProp: boolean
): SagaIterator {
  const signatureRequestId = yield* select(fciSignatureRequestIdSelector);
  const activeSessionLoginFlow = yield* select(activeSessionLoginFlowSelector);
  yield* put(setActiveSessionLoginFlow(undefined));

  if (
    isActiveLoginSuccessProp &&
    signatureRequestId &&
    activeSessionLoginFlow === "FCI"
  ) {
    yield* put(fciSignatureRequestRetryFromId(signatureRequestId));
  }
  return;
}

/**
 * Handle the FCI Signature requests
 * @param bearerToken
 */
export function* watchFciSaga(
  bearerToken: string,
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

  // handle the request of retrying a signature, getting FCI signatureRequestDetails and restarting the signing flow
  yield* takeLatest(
    fciSignatureRequestRetryFromId,
    watchFciSignatureRequestRetrySaga
  );

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
 * Clears cached file for the fci document preview
 * and reset the state to empty.
 */
function* clearAllFciFiles(action: ActionType<typeof fciClearAllFiles>) {
  yield* deletePath(action.payload.path);
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

function* deletePath(path: string) {
  yield RNFS.exists(path).then(exists =>
    exists ? RNFS.unlink(path) : Promise.resolve()
  );
}

function* standardFciFlowStartSaga(): SagaIterator {
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
 * Handle the FCI signature request retry saga
 */
function* watchFciSignatureRequestRetrySaga(
  action: ActionType<typeof fciSignatureRequestRetryFromId>
): SagaIterator {
  // get new SignatureRequestDetails
  yield* put(fciSignatureRequestFromId.request(action.payload));

  while (true) {
    const result = yield* take([
      fciSignatureRequestFromId.success,
      fciSignatureRequestFromId.failure
    ]);

    if (isActionOf(fciSignatureRequestFromId.success, result)) {
      if (result.payload.id === action.payload) {
        /**
         * when restarting the flow from 'DocumentUnavailableScreen',
         * FciDocumentsScreen will still get pot error if not reset
         */
        yield* put(fciDownloadPreview.cancel());
        // start a new signing flow
        yield* put(fciStartRequest());
        return;
      }

      continue;
    }

    if (isActionOf(fciSignatureRequestFromId.failure, result)) {
      return;
    }
  }
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

/**
 * Handle the FCI start requests saga
 */
function* watchFciStartSaga(): SagaIterator {
  const spidLevel = yield* select(spidLevelFromSessionInfoSelector);
  const isFciSecurityLevelCheckEnabled = yield* select(
    isFciSecurityLevelCheckRemoteFFEnabledSelector
  );

  if (!isFciSecurityLevelCheckEnabled) {
    yield* call(standardFciFlowStartSaga);
    return;
  } else {
    if (spidLevel === "L3") {
      yield* call(standardFciFlowStartSaga);
      return;
    }
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.push(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.FCI_LOGIN_L3
      })
    );
    return;
  }
}

/**
 * Handle the identification pin reset to clear fci state
 */
function* watchIdentificationPinResetSaga(): SagaIterator {
  yield* put(fciClearStateRequest());
}

export const testable = isTestEnv
  ? {
      watchIdentificationPinResetSaga,
      watchFciQtspClausesSaga,
      standardFciFlowStartSaga,
      watchFciStartSaga,
      watchFciSignatureRequestRetrySaga,
      clearFciDownloadPreview,
      watchFciSigningRequestSaga,
      clearAllFciFiles,
      watchFciEndSaga
    }
  : undefined;
