import * as pot from "@pagopa/ts-commons/lib/pot";
import { combineReducers } from "redux";
import { isActionOf } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import {
  fciClearStateRequest,
  fciSignatureRequestRetrySuccess
} from "../actions";
import fciDocumentSignaturesReducer, {
  FciDocumentSignaturesState
} from "./fciDocumentSignatures";
import fciDownloadPreviewReducer, {
  FciDownloadPreviewState
} from "./fciDownloadPreview";
import fciEnvironmentReducer, { FciEnvironmentState } from "./fciEnvironment";
import fciMetadataReducer, { FciMetadataRequestState } from "./fciMetadata";
import fciPollFilledDocumentReducer, {
  FciPollFilledDocumentState
} from "./fciPollFilledDocument";
import fciQtspClausesReducer, { FciQtspClausesState } from "./fciQtspClauses";
import fciLoadQtspFilledDocumentReducer, {
  FciQtspFilledDocumentState
} from "./fciQtspFilledDocument";
import fciSignatureReducer, { FciSignatureState } from "./fciSignature";
import fciSignatureFieldDrawingReducer, {
  FciSignatureFieldDrawingState
} from "./fciSignatureFieldDrawing";
import fciSignatureRequestReducer, {
  FciSignatureRequestState
} from "./fciSignatureRequest";
import fciSignaturesListRequestReducer, {
  FciSignaturesListRequestState
} from "./fciSignaturesList";

export type FciState = {
  documentPreview: FciDownloadPreviewState;
  documentSignatures: FciDocumentSignaturesState;
  environment: FciEnvironmentState;
  metadata: FciMetadataRequestState;
  pollFilledDocument: FciPollFilledDocumentState;
  qstpFilledDocument: FciQtspFilledDocumentState;
  qtspClauses: FciQtspClausesState;
  signature: FciSignatureState;
  signatureFieldDrawing: FciSignatureFieldDrawingState;
  signatureRequest: FciSignatureRequestState;
  signaturesList: FciSignaturesListRequestState;
};

const innerFciReducer = combineReducers<FciState, Action>({
  signatureRequest: fciSignatureRequestReducer,
  qtspClauses: fciQtspClausesReducer,
  qstpFilledDocument: fciLoadQtspFilledDocumentReducer,
  signature: fciSignatureReducer,
  documentSignatures: fciDocumentSignaturesReducer,
  signatureFieldDrawing: fciSignatureFieldDrawingReducer,
  documentPreview: fciDownloadPreviewReducer,
  pollFilledDocument: fciPollFilledDocumentReducer,
  metadata: fciMetadataReducer,
  signaturesList: fciSignaturesListRequestReducer,
  environment: fciEnvironmentReducer
});

// initial state
const fciInitialState = innerFciReducer(undefined, fciClearStateRequest());

const fciReducer = (state: FciState | undefined, action: Action): FciState => {
  if (isActionOf(fciSignatureRequestRetrySuccess, action)) {
    return { ...fciInitialState, signatureRequest: pot.some(action.payload) };
  }
  return innerFciReducer(state, action);
};

export default fciReducer;
