import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  fciAbortingRequest,
  fciLoadQtspClauses
} from "../actions/fciSignatureRequest";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { QtspClausesMetadata } from "../../../../../definitions/fci/QtspClausesMetadata";

export type FciQtspClausesRequestState = pot.Pot<
  QtspClausesMetadata,
  NetworkError
>;

const emptyState: FciQtspClausesRequestState = pot.none;

const reducer = (
  state: FciQtspClausesRequestState = emptyState,
  action: Action
): FciQtspClausesRequestState => {
  switch (action.type) {
    case getType(fciLoadQtspClauses.request):
      return pot.toLoading(state);
    case getType(fciLoadQtspClauses.success):
      return pot.some(action.payload);
    case getType(fciLoadQtspClauses.failure):
      return pot.toError(state, action.payload);
    case getType(fciAbortingRequest):
      return emptyState;
  }

  return state;
};

export default reducer;
