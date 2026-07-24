import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { SignatureRequestList } from "../../../../../definitions/fci/SignatureRequestList";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciClearStateRequest, fciSignaturesListRequest } from "../actions";

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
    case getType(fciClearStateRequest):
      return emptyState;
    case getType(fciSignaturesListRequest.failure):
      return pot.toError(state, action.payload);
    case getType(fciSignaturesListRequest.request):
      return pot.toLoading(state);
    case getType(fciSignaturesListRequest.success):
      return pot.some(action.payload);
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
