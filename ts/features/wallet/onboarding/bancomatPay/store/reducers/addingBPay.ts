import { getType } from "typesafe-actions";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { RawBPayPaymentMethod } from "../../../../../../types/pagopa";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { addBPayToWallet, walletAddBPayStart } from "../actions";
import { NetworkError } from "../../../../../../utils/errors";

export type AddingBPayState = {
  addingResult: RemoteValue<RawBPayPaymentMethod, NetworkError>;
  selectedBPay?: BPay;
};

const initialState: AddingBPayState = {
  addingResult: remoteUndefined
};

const addingBPayReducer = (
  state: AddingBPayState = initialState,
  action: Action
): AddingBPayState => {
  switch (action.type) {
    case getType(addBPayToWallet.request):
      return {
        selectedBPay: action.payload,
        addingResult: remoteLoading
      };
    case getType(addBPayToWallet.success):
      return {
        ...state,
        addingResult: remoteReady(action.payload)
      };
    case getType(addBPayToWallet.failure):
      return {
        ...state,
        addingResult: remoteError(action.payload)
      };
    case getType(walletAddBPayStart):
      return initialState;
  }
  return state;
};

export const onboardingBPayChosenPanSelector = (
  state: GlobalState
): BPay | undefined => state.wallet.onboarding.bPay.addingBPay.selectedBPay;

export const onboardingBPayAddingResultSelector = (
  state: GlobalState
): RemoteValue<RawBPayPaymentMethod, NetworkError> =>
  state.wallet.onboarding.bPay.addingBPay.addingResult;

export default addingBPayReducer;
