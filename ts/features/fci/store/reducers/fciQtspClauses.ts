import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fciLoadQtspClauses, fciAbortRequest } from "../actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { QtspClausesMetadata } from "../../../../../definitions/fci/QtspClausesMetadata";
import { GlobalState } from "../../../../store/reducers/types";

export type FciQtspClausesState = pot.Pot<QtspClausesMetadata, NetworkError>;

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
    case getType(fciAbortRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciQtspClausesSelector = (
  state: GlobalState
): FciQtspClausesState => state.features.fci.qtspClauses;

export default reducer;
