// The satispay account found could be one (Satispay) or null (no satispay account found)
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Satispay } from "../../../../../../../definitions/pagopa/walletv2/Satispay";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  getValueOrElse,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue,
  fold
} from "../../../../../bonus/bpd/model/RemoteValue";
import { Pans } from "../../../bancomat/store/reducers/pans";
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

/**
 * Return the remote value of the found satispay
 * @param state
 */
export const onboardingSatispayFoundRemoteSelector = (
  state: GlobalState
): RemoteSatispay => state.wallet.onboarding.satispay.foundSatispay;

/**
 * Return the found satispay
 * @param state
 */
export const onboardingSatispayFoundSelector = createSelector(
  [onboardingSatispayFoundRemoteSelector],
  (remoteSatispay): Satispay | undefined =>
    fold(
      remoteSatispay,
      () => undefined,
      () => undefined,
      val => (val !== null ? val : undefined),
      _ => undefined
    )
);
