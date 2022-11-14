import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciSignatureRequestFromId } from "../actions";

export type FciSignatureRequestState = pot.Pot<
  SignatureRequestDetailView,
  NetworkError
>;

const emptyState: FciSignatureRequestState = pot.none;

const reducer = (
  state: FciSignatureRequestState = emptyState,
  action: Action
): FciSignatureRequestState => {
  switch (action.type) {
    case getType(fciSignatureRequestFromId.request):
      return pot.toLoading(state);
    case getType(fciSignatureRequestFromId.success):
      return pot.some(action.payload);
    case getType(fciSignatureRequestFromId.failure):
      return pot.toError(state, action.payload);
  }

  return state;
};

// Selectors
export const fciSignatureRequestSelector = (
  state: GlobalState
): FciSignatureRequestState => state.features.fci.signatureRequest;

export default reducer;
