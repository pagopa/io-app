import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { CoBadgeResponse, searchUserCoBadge } from "../actions";

export type RemoteCoBadge = RemoteValue<
  ReadonlyArray<CoBadgeResponse>,
  NetworkError
>;

const foundCoBadgeReducer = (
  state: RemoteCoBadge = remoteUndefined,
  action: Action
): RemoteCoBadge => {
  switch (action.type) {
    case getType(searchUserCoBadge.request):
      return remoteLoading;
    case getType(searchUserCoBadge.success):
      return remoteReady(action.payload);
    case getType(searchUserCoBadge.failure):
      return remoteError(action.payload);
  }
  return state;
};

/**
 * Return {@link RemoteCoBadge}, a list of Cobadge cards to be viewed by the user.
 * Remove from the list the disabled accounts
 * @param state
 */
export const onboardingCoBadgeFoundSelector = (
  state: GlobalState
): RemoteCoBadge => state.wallet.onboarding.coBadge.foundCoBadge;

/**
 * The search CoBadge API have an error
 * @param state
 */
export const onboardingCoBadgeFoundIsError = (state: GlobalState): boolean =>
  isError(state.wallet.onboarding.coBadge.foundCoBadge);

export default foundCoBadgeReducer;
