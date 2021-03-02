import { getType } from "typesafe-actions";
import { CobadgeResponse } from "../../../../../../../definitions/pagopa/walletv2/CobadgeResponse";
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
import { searchUserPrivative } from "../actions";

export type RemotePrivative = RemoteValue<CobadgeResponse, NetworkError>;

const foundPrivativeReducer = (
  state: RemotePrivative = remoteUndefined,
  action: Action
): RemotePrivative => {
  switch (action.type) {
    case getType(searchUserPrivative.request):
      return remoteLoading;
    case getType(searchUserPrivative.success):
      return remoteReady(action.payload);
    case getType(searchUserPrivative.failure):
      return remoteError(action.payload);
  }
  return state;
};

/**
 * Return {@link RemotePrivative}, a list of Privative cards to be viewed by the user with response metadata.
 * @param state
 */
export const onboardingPrivativeFoundSelector = (
  state: GlobalState
): RemotePrivative => state.wallet.onboarding.privative.foundPrivative;

/**
 * The search privative API have an error
 * @param state
 */
export const onboardingPrivativeFoundIsError = (state: GlobalState): boolean =>
  isError(state.wallet.onboarding.privative.foundPrivative);

export default foundPrivativeReducer;
