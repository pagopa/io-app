import { pipe } from "fp-ts/lib/function";
import { updateAt } from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { DocumentSignature } from "../../../../../definitions/fci/DocumentSignature";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  fciAbortRequest,
  fciUpdateDocumentSignaturesRequest
} from "../actions";

export type FciDocumentSignaturesState = {
  documents: ReadonlyArray<DocumentSignature>;
};

const emptyState: FciDocumentSignaturesState = {
  documents: []
};

const reducer = (
  state: FciDocumentSignaturesState = emptyState,
  action: Action
): FciDocumentSignaturesState => {
  switch (action.type) {
    case getType(fciUpdateDocumentSignaturesRequest):
      return {
        ...state,
        documents: pipe(
          updateAt(
            state.documents.findIndex(
              d => d.document_id === action.payload.document_id
            ),
            action.payload
          )(state.documents),
          O.getOrElse(
            () =>
              [
                ...state.documents,
                action.payload
              ] as ReadonlyArray<DocumentSignature>
          )
        )
      };
    case getType(fciAbortRequest):
      return emptyState;
  }
  return state;
};

// Selectors
export const fciDocumentSignaturesSelector = (
  state: GlobalState
): FciDocumentSignaturesState["documents"] =>
  state.features.fci.documentSignatures.documents;

export default reducer;
