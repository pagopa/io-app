import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { fciDocumentSignatureFields } from "../actions";

export type DrawnDocument = {
  document: string;
  page: number;
};

export type RawDocument = {
  uri: O.Option<string>;
  document: O.Option<string>;
};

export type FciDocumentSignatureFieldsState = {
  rawDocument: RawDocument;
  drawnDocument: pot.Pot<DrawnDocument, Error>;
};

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

export const fciSignatureFieldDrawingSelector = (state: GlobalState) =>
  state.features.fci.documentSignaturesFields;

export const fciSignatureFieldDrawingRawUriSelector = (state: GlobalState) =>
  pipe(
    state.features.fci.documentSignaturesFields.rawDocument.uri,
    O.getOrElse(() => "")
  );

export const fciSignatureFieldDrawingRawDocumentSelector = (
  state: GlobalState
) =>
  pipe(
    state.features.fci.documentSignaturesFields.rawDocument.document,
    O.getOrElse(() => "")
  );
