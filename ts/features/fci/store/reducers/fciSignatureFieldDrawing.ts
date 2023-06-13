import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { fciDocumentSignatureFields } from "../actions";

/**
 * The drawn document type used in a pot.
 */
export type DrawnDocument = {
  document: string;
  page: number;
};

/**
 * The raw document type which includes the string representation of the document and its uri.
 */
export type RawDocument = {
  uri: O.Option<string>;
  document: O.Option<string>;
};

/**
 * The state of the fci document signature fields.
 */
export type FciDocumentSignatureFieldsState = {
  rawDocument: RawDocument;
  drawnDocument: pot.Pot<DrawnDocument, Error>;
};

/**
 * The initial state of the fci document signature fields.
 */
const emptyState: FciDocumentSignatureFieldsState = {
  rawDocument: { document: O.none, uri: O.none },
  drawnDocument: pot.none
};

const fciSignatureFieldDrawingReducer = (
  state: FciDocumentSignatureFieldsState = emptyState,
  action: Action
): FciDocumentSignatureFieldsState => {
  switch (action.type) {
    case getType(fciDocumentSignatureFields.request):
      return {
        ...state,
        drawnDocument: pot.toLoading(state.drawnDocument)
      };
    case getType(fciDocumentSignatureFields.success):
      return {
        ...state,
        ...action.payload
      };
    case getType(fciDocumentSignatureFields.failure):
      return {
        ...state,
        drawnDocument: pot.toError(state.drawnDocument, action.payload)
      };
  }
  return state;
};

export default fciSignatureFieldDrawingReducer;

/**
 * Selector of the fci document signature fields state.
 * @param state the global state
 * @returns the fci document signature fields state
 */
export const fciSignatureFieldDrawingSelector = (state: GlobalState) =>
  state.features.fci.documentSignaturesFields;

/**
 * Selector of the raw document signature fields uri.
 * @param state the global state
 * @returns the raw document signature fields uri
 */
export const fciSignatureFieldDrawingRawUriSelector = (state: GlobalState) =>
  pipe(
    state.features.fci.documentSignaturesFields.rawDocument.uri,
    O.getOrElse(() => "")
  );

/**
 * Selector of the raw document signature fields document string representation.
 * @param state the global state
 * @returns the raw document string representation
 */
export const fciSignatureFieldDrawingRawDocumentSelector = (
  state: GlobalState
) =>
  pipe(
    state.features.fci.documentSignaturesFields.rawDocument.document,
    O.getOrElse(() => "")
  );
