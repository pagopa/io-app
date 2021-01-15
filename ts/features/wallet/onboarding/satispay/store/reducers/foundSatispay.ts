// The satispay account found could be one (Satispay) or null (no satispay account found)
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  fold,
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { searchUserSatispay } from "../actions";
import { onboardingSatispayAddingResultSelector } from "./addingSatispay";

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

/**
 * Return the remote value of the found satispay
 * @param state
 */
export const onboardingSatispayFoundRemoteSelector = (
  state: GlobalState
): RemoteSatispay => state.wallet.onboarding.satispay.foundSatispay;

/**
 * Return the found satispay, without the remote state
 * @param state
 */
export const onboardingSatispayFoundSelector = createSelector(
  [onboardingSatispayFoundRemoteSelector],
  (remoteSatispay): Satispay | undefined =>
    fold(
      remoteSatispay,
      () => undefined,
      () => undefined,
      val => val ?? undefined,
      _ => undefined
    )
);

export const onboardingSatispayIsErrorSelector = createSelector(
  [onboardingSatispayAddingResultSelector],
  remoteSatispay => isError(remoteSatispay)
);
