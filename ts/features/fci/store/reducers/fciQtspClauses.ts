import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fciLoadQtspClauses, fciClearStateRequest } from "../actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { QtspClausesMetadataDetailView } from "../../../../../definitions/fci/QtspClausesMetadataDetailView";
import { GlobalState } from "../../../../store/reducers/types";

export type FciQtspClausesState = pot.Pot<
  QtspClausesMetadataDetailView,
  NetworkError
>;

const emptyState: FciQtspClausesState = pot.none;

const reducer = (
  state: FciQtspClausesState = emptyState,
  action: Action
): FciQtspClausesState => {
  switch (action.type) {
    case getType(fciLoadQtspClauses.request):
      return pot.toLoading(state);
    case getType(fciLoadQtspClauses.success):
      return pot.some(action.payload);
    case getType(fciLoadQtspClauses.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciQtspClausesMetadataSelector = (
  state: GlobalState
): FciQtspClausesState => state.features.fci.qtspClauses;

export const fciQtspClausesSelector = createSelector(
  fciQtspClausesMetadataSelector,
  qtspClausesMetadata =>
    pot.isSome(qtspClausesMetadata) ? qtspClausesMetadata.value.clauses : []
);

export const fciQtspPrivacyTextSelector = createSelector(
  fciQtspClausesMetadataSelector,
  qtspClausesMetadata =>
    pot.isSome(qtspClausesMetadata)
      ? qtspClausesMetadata.value.privacy_text
      : ""
);

export const fciQtspPrivacyUrlSelector = createSelector(
  fciQtspClausesMetadataSelector,
  qtspClausesMetadata =>
    pot.isSome(qtspClausesMetadata) ? qtspClausesMetadata.value.privacy_url : ""
);

export const fciQtspDocumentUrlSelector = createSelector(
  fciQtspClausesMetadataSelector,
  qtspClausesMetadata =>
    pot.isSome(qtspClausesMetadata)
      ? qtspClausesMetadata.value.document_url
      : ""
);

export const fciQtspTosUrlSelector = createSelector(
  fciQtspClausesMetadataSelector,
  qtspClausesMetadata =>
    pot.isSome(qtspClausesMetadata)
      ? qtspClausesMetadata.value.terms_and_conditions_url
      : ""
);

export const fciQtspNonceSelector = createSelector(
  fciQtspClausesMetadataSelector,
  qtspClausesMetadata =>
    pot.isSome(qtspClausesMetadata) ? qtspClausesMetadata.value.nonce : ""
);

export default reducer;
