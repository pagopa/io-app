import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciClearStateRequest, fciSignaturesListRequest } from "../actions";
import { SignatureRequestList } from "../../../../../definitions/fci/SignatureRequestList";

export type FciSignaturesListRequestState = pot.Pot<
  SignatureRequestList,
  NetworkError
>;

const emptyState: FciSignaturesListRequestState = pot.none;

const reducer = (
  state: FciSignaturesListRequestState = emptyState,
  action: Action
): FciSignaturesListRequestState => {
  switch (action.type) {
    case getType(fciSignaturesListRequest.request):
      return pot.toLoading(state);
    case getType(fciSignaturesListRequest.success):
      return pot.some(action.payload);
    case getType(fciSignaturesListRequest.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciSignaturesListRequestSelector = (
  state: GlobalState
): FciSignaturesListRequestState => state.features.fci.signaturesList;

export const fciSignaturesListSelector = createSelector(
  fciSignaturesListRequestSelector,
  signaturesList =>
    pot.isSome(signaturesList) ? signaturesList.value.items : []
);

export default reducer;
