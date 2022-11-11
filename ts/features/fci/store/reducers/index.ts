import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import fciQtspClausesReducer, { FciQtspClausesState } from "./fciQtspClauses";
import fciLoadQtspFilledDocumentReducer, {
  FciQtspFilledDocumentState
} from "./fciQtspFilledDocument";
import fciSignatureReducer, { FciSignatureState } from "./fciSignature";
import fciSignatureRequestReducer, {
  FciSignatureRequestState
} from "./fciSignatureRequest";

export type FciState = {
  signatureRequest: FciSignatureRequestState;
  qtsp: FciQtspClausesState;
  qstpFilledDocument: FciQtspFilledDocumentState;
  signature: FciSignatureState;
};

const fciReducer = combineReducers<FciState, Action>({
  signatureRequest: fciSignatureRequestReducer,
  qtsp: fciQtspClausesReducer,
  qstpFilledDocument: fciLoadQtspFilledDocumentReducer,
  signature: fciSignatureReducer
});

export default fciReducer;
