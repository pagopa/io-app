import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { NetworkError } from "../../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserSatispay } from "../actions";

export type OnboardSatispayState = {
  // A RemoteValue that represent the found satispay account for the user
  foundSatispay: RemoteSatispay;
};

// The satispay account found could be one (Satispay) or null (no satispay account found)
export type RemoteSatispay = RemoteValue<Satispay | null, NetworkError>;

const foundSatispayReducer = (
  state: RemoteSatispay = remoteUndefined,
  action: Action
): RemoteSatispay => {
  switch (action.type) {
    case getType(searchUserSatispay.request):
      return remoteLoading;
    case getType(searchUserSatispay.success):
      return remoteReady(action.payload);
    case getType(searchUserSatispay.failure):
      return remoteError(action.payload);
  }
  return state;
};

const onboardingSatispayReducer = combineReducers<OnboardSatispayState, Action>(
  {
    // the satispay account found for the user during the onboarding phase
    foundSatispay: foundSatispayReducer
  }
);

export default onboardingSatispayReducer;
