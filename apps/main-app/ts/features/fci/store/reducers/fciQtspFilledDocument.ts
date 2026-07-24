import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciClearStateRequest, fciLoadQtspFilledDocument } from "../actions";

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
    case getType(fciClearStateRequest):
      return emptyState;
    case getType(fciLoadQtspFilledDocument.failure):
      return pot.toError(state, action.payload);
    case getType(fciLoadQtspFilledDocument.request):
      return pot.toLoading(state);
    case getType(fciLoadQtspFilledDocument.success):
      return pot.some(action.payload);
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
