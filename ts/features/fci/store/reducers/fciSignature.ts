import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { SignatureDetailView } from "../../../../../definitions/fci/SignatureDetailView";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciSigningRequest, fciClearStateRequest } from "../actions";

export type FciSignatureState = pot.Pot<SignatureDetailView, NetworkError>;

const emptyState: FciSignatureState = pot.none;

const reducer = (
  state: FciSignatureState = emptyState,
  action: Action
): FciSignatureState => {
  switch (action.type) {
    case getType(fciSigningRequest.request):
      return pot.toLoading(state);
    case getType(fciSigningRequest.success):
      return pot.some(action.payload);
    case getType(fciSigningRequest.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciSignatureSelector = (state: GlobalState): FciSignatureState =>
  state.features.fci.signature;

export default reducer;
