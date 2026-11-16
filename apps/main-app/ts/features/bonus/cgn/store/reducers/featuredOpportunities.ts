import { getType } from "typesafe-actions";

import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  cgnFeaturedOpportunities,
  ResolvedCgnFeaturedOpportunity
} from "../actions/merchants";

export type CgnFeaturedOpportunitiesState = RemoteValue<
  ReadonlyArray<ResolvedCgnFeaturedOpportunity>,
  NetworkError
>;

export default function featuredOpportunitiesReducer(
  state: CgnFeaturedOpportunitiesState = remoteUndefined,
  action: Action
): CgnFeaturedOpportunitiesState {
  switch (action.type) {
    case getType(cgnFeaturedOpportunities.failure):
      return remoteError(action.payload);
    case getType(cgnFeaturedOpportunities.request):
      return remoteLoading;
    case getType(cgnFeaturedOpportunities.success):
      return remoteReady(action.payload);
    default:
      return state;
  }
}
