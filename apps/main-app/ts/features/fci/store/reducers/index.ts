import { combineReducers } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { isActionOf } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import {
  fciClearStateRequest,
  fciSignatureRequestRetrySuccess
} from "../actions";
import fciDocumentSignaturesReducer, {
  FciDocumentSignaturesState
} from "./fciDocumentSignatures";
import fciQtspClausesReducer, { FciQtspClausesState } from "./fciQtspClauses";
import fciLoadQtspFilledDocumentReducer, {
  FciQtspFilledDocumentState
} from "./fciQtspFilledDocument";
import fciSignatureReducer, { FciSignatureState } from "./fciSignature";
import fciSignatureRequestReducer, {
  FciSignatureRequestState
} from "./fciSignatureRequest";
import fciDownloadPreviewReducer, {
  FciDownloadPreviewState
} from "./fciDownloadPreview";
import fciPollFilledDocumentReducer, {
  FciPollFilledDocumentState
} from "./fciPollFilledDocument";
import fciMetadataReducer, { FciMetadataRequestState } from "./fciMetadata";
import fciSignaturesListRequestReducer, {
  FciSignaturesListRequestState
} from "./fciSignaturesList";
import fciSignatureFieldDrawingReducer, {
  FciSignatureFieldDrawingState
} from "./fciSignatureFieldDrawing";
import fciEnvironmentReducer, { FciEnvironmentState } from "./fciEnvironment";
import {
  fciSecurityLevelReducer,
  FciSecurityLevelStateType
} from "./fciSecurityLevelReducer";

export type FciState = {
  signatureRequest: FciSignatureRequestState;
  qtspClauses: FciQtspClausesState;
  qstpFilledDocument: FciQtspFilledDocumentState;
  signature: FciSignatureState;
  documentSignatures: FciDocumentSignaturesState;
  signatureFieldDrawing: FciSignatureFieldDrawingState;
  documentPreview: FciDownloadPreviewState;
  pollFilledDocument: FciPollFilledDocumentState;
  metadata: FciMetadataRequestState;
  signaturesList: FciSignaturesListRequestState;
  environment: FciEnvironmentState;
  securityLevel: FciSecurityLevelStateType;
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
  environment: fciEnvironmentReducer,
  securityLevel: fciSecurityLevelReducer
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
