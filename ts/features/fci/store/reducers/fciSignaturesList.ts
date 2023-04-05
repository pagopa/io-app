import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import {
  fciSignatureRequestFromId,
  fciClearStateRequest,
  fciSignaturesListRequest
} from "../actions";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import { QtspDocumentToSign } from "../../utils/signature";
import { IssuerEnvironmentEnum } from "../../../../../definitions/fci/IssuerEnvironment";
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

export default reducer;
