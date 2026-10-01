import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { fciDocumentSignatureFields } from "../actions";

export type Document = {
  drawnBase64: string;
  rawBase64: string;
  signaturePage: number;
  uri: string;
};

/** The state of the fci document signature fields. */
export type FciSignatureFieldDrawingState = pot.Pot<Document, Error>;

/** The initial state of the fci document signature fields. */
const emptyState: FciSignatureFieldDrawingState = pot.none;

const fciSignatureFieldDrawingReducer = (
  state: FciSignatureFieldDrawingState = emptyState,
  action: Action
): FciSignatureFieldDrawingState => {
  switch (action.type) {
    case getType(fciDocumentSignatureFields.failure):
      return pot.toError(state, action.payload);
    case getType(fciDocumentSignatureFields.request):
      return pot.toLoading(state);
    case getType(fciDocumentSignatureFields.success):
      return pot.some({
        ...state,
        ...action.payload
      });
  }
  return state;
};

export default fciSignatureFieldDrawingReducer;

/**
 * Selector of the fci document signature fields state.
 *
 * @param state The global state
 * @returns The fci document signature fields state
 */
export const fciSignatureFieldDrawingSelector = (state: GlobalState) =>
  state.features.fci.signatureFieldDrawing;
