// bonus reducer
import { getType } from "typesafe-actions";
import { DocumentSignature } from "../../../../../definitions/fci/DocumentSignature";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  fciAbortingRequest,
  fciAddDocumentSignaturesRequest,
  fciUpdateDocumentSignaturesRequest
} from "../actions";

export type FciDocumentSignaturesState = {
  documentSignatures: ReadonlyArray<DocumentSignature>;
};

const emptyState: FciDocumentSignaturesState = {
  documentSignatures: []
};

const reducer = (
  state: FciDocumentSignaturesState = emptyState,
  action: Action
): FciDocumentSignaturesState => {
  switch (action.type) {
    case getType(fciAddDocumentSignaturesRequest):
      return {
        ...state,
        documentSignatures: [...state.documentSignatures, action.payload]
      };
    case getType(fciUpdateDocumentSignaturesRequest):
      return {
        ...state,
        documentSignatures: state.documentSignatures.map(d =>
          d.document_id === action.payload.document_id ? action.payload : d
        )
      };
    case getType(fciAbortingRequest):
      return emptyState;
  }
  return state;
};

// Selectors
export const fciDocumentSignaturesSelector = (
  state: GlobalState
): FciDocumentSignaturesState => state.features.fci.documentSignatures;

export default reducer;
