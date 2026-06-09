import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciClearStateRequest, fciMetadataRequest } from "../actions";
import { Metadata } from "../../../../../definitions/fci/Metadata";

export type FciMetadataRequestState = pot.Pot<Metadata, NetworkError>;

const emptyState: FciMetadataRequestState = pot.none;

const reducer = (
  state: FciMetadataRequestState = emptyState,
  action: Action
): FciMetadataRequestState => {
  switch (action.type) {
    case getType(fciMetadataRequest.request):
      return pot.toLoading(state);
    case getType(fciMetadataRequest.success):
      return pot.some(action.payload);
    case getType(fciMetadataRequest.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciMetadataSelector = (
  state: GlobalState
): FciMetadataRequestState => state.features.fci.metadata;

export const fciMetadataServiceIdSelector = createSelector(
  fciMetadataSelector,
  fciMetadata =>
    pot.isSome(fciMetadata) ? fciMetadata.value.serviceId : undefined
);

export default reducer;
