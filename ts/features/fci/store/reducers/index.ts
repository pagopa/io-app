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

export type FciState = {
  signatureRequest: FciSignatureRequestState;
  qtspClauses: FciQtspClausesState;
  qstpFilledDocument: FciQtspFilledDocumentState;
  signature: FciSignatureState;
  documentSignatures: FciDocumentSignaturesState;
  documentPreview: FciDownloadPreviewState;
};

const fciReducer = combineReducers<FciState, Action>({
  signatureRequest: fciSignatureRequestReducer,
  qtspClauses: fciQtspClausesReducer,
  qstpFilledDocument: fciLoadQtspFilledDocumentReducer,
  signature: fciSignatureReducer,
  documentSignatures: fciDocumentSignaturesReducer,
  documentPreview: fciDownloadPreviewReducer
});

export default fciReducer;
