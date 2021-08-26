import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { RawSatispayPaymentMethod } from "../../../../../../types/pagopa";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { addSatispayToWallet, walletAddSatispayStart } from "../actions";

export const addingSatispayReducer = (
  state: RemoteValue<RawSatispayPaymentMethod, Error> = remoteUndefined,
  action: Action
): RemoteValue<RawSatispayPaymentMethod, Error> => {
  switch (action.type) {
    case getType(addSatispayToWallet.request):
      return remoteLoading;
    case getType(addSatispayToWallet.success):
      return remoteReady(action.payload);
    case getType(addSatispayToWallet.failure):
      return remoteError(action.payload);
    case getType(walletAddSatispayStart):
      return remoteUndefined;
  }
  return state;
};

export const onboardingSatispayAddingResultSelector = (
  state: GlobalState
): RemoteValue<RawSatispayPaymentMethod, Error> =>
  state.wallet.onboarding.satispay.addingSatispay;
