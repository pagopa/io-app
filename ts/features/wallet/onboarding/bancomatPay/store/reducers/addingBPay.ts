import { getType } from "typesafe-actions";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { Card } from "../../../../../../../definitions/pagopa/walletv2/Card";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  RawBancomatPaymentMethod,
  RawBPayPaymentMethod
} from "../../../../../../types/pagopa";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { addBPayToWallet } from "../actions";

export type AddingBPayState = {
  addingResult: RemoteValue<RawBPayPaymentMethod, Error>;
  selectedPan?: BPay;
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
        selectedPan: action.payload,
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
  }
  return state;
};

export const onboardingBPayChosenPanSelector = (
  state: GlobalState
): Card | undefined => state.wallet.onboarding.bancomat.addingPans.selectedPan;

export const onboardingBPayAddingResultSelector = (
  state: GlobalState
): RemoteValue<RawBPayPaymentMethod, Error> =>
  state.wallet.onboarding.bPay.addingBPay.addingResult;

export default addingBPayReducer;
