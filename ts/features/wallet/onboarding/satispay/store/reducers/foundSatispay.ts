// The satispay account found could be one (Satispay) or null (no satispay account found)
import { getType } from "typesafe-actions";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { Action } from "../../../../../../store/actions/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserSatispay } from "../actions";

export type RemoteSatispay = RemoteValue<Satispay | null, NetworkError>;

export const foundSatispayReducer = (
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
