import { combineReducers } from "redux";

import { Action } from "../../../../store/actions/types";
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
import {
  fciSecurityLevelReducer,
  FciSecurityLevelStateType
} from "./fciSecurityLevelReducer";
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
  securityLevel: FciSecurityLevelStateType;
  signature: FciSignatureState;
  signatureFieldDrawing: FciSignatureFieldDrawingState;
  signatureRequest: FciSignatureRequestState;
  signaturesList: FciSignaturesListRequestState;
};

const fciReducer = combineReducers<FciState, Action>({
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

export default fciReducer;
