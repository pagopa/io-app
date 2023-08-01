import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
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
  signaturesList: fciSignaturesListRequestReducer
});

export default fciReducer;
