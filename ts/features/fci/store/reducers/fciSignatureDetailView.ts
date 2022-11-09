import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciSignatureRequestFromId } from "../actions/fciSignatureRequest";

export type FciSignatureDetailViewRequestState = pot.Pot<
  SignatureRequestDetailView,
  NetworkError
>;

const emptyState: FciSignatureDetailViewRequestState = pot.none;

const reducer = (
  state: FciSignatureDetailViewRequestState = emptyState,
  action: Action
): FciSignatureDetailViewRequestState => {
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
export const fciSignatureDetailViewSelector = (
  state: GlobalState
): FciSignatureDetailViewRequestState => state.features.fci.signatureDetailView;

export default reducer;
