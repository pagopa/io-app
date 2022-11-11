import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import fciQtspClausesReducer, {
  FciQtspClausesRequestState
} from "./fciQtspClauses";
import fciLoadQtspFilledDocumentReducer, {
  FciQtspFilledDocumentRequestState
} from "./fciQtspFilledDocument";
import fciSignatureState, { FciSignatureState } from "./fciSignature";
import fciSignatureDetailViewReducer, {
  FciSignatureDetailViewRequestState
} from "./fciSignatureDetailView";

export type FciState = {
  signatureRequest: FciSignatureRequestRequestState;
  qtspClauses: FciQtspClausesRequestState;
  qstpFilledDocument: FciQtspFilledDocumentRequestState;
  signature: FciSignatureState;
};

const fciReducer = combineReducers<FciState, Action>({
  signatureDetailView: fciSignatureDetailViewReducer,
  qtsp: fciQtspClausesReducer,
  filled_document: fciLoadQtspFilledDocumentReducer,
  signature: fciSignatureState
});

export default fciReducer;
