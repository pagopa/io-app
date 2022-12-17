import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { fciLoadQtspFilledDocument, fciClearStateRequest } from "../actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";
import { GlobalState } from "../../../../store/reducers/types";

export type FciQtspFilledDocumentState = pot.Pot<
  FilledDocumentDetailView,
  NetworkError
>;

const emptyState: FciQtspFilledDocumentState = pot.none;

const reducer = (
  state: FciQtspFilledDocumentState = emptyState,
  action: Action
): FciQtspFilledDocumentState => {
  switch (action.type) {
    case getType(fciLoadQtspFilledDocument.request):
      return pot.toLoading(state);
    case getType(fciLoadQtspFilledDocument.success):
      return pot.some(action.payload);
    case getType(fciLoadQtspFilledDocument.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciQtspFilledDocumentSelector = (
  state: GlobalState
): FciQtspFilledDocumentState => state.features.fci.qstpFilledDocument;

export const fciQtspFilledDocumentUrlSelector = createSelector(
  fciQtspFilledDocumentSelector,
  qtspFilledDocument =>
    pot.isSome(qtspFilledDocument)
      ? qtspFilledDocument.value.filled_document_url
      : ""
);

export default reducer;
