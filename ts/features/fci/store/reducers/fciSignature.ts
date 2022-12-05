import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciSigningRequest, fciAbortRequest } from "../actions";

export type FciSignatureState = pot.Pot<void, NetworkError>;

const emptyState: FciSignatureState = pot.none;

const reducer = (
  state: FciSignatureState = emptyState,
  action: Action
): FciSignatureState => {
  switch (action.type) {
    case getType(fciSigningRequest.request):
      return pot.toLoading(state);
    case getType(fciSigningRequest.success):
      return pot.none;
    case getType(fciSigningRequest.failure):
      return pot.toError(state, action.payload);
    case getType(fciAbortRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciSignatureSelector = (state: GlobalState): FciSignatureState =>
  state.features.fci.signature;

export default reducer;
