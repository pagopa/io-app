import { getType } from "typesafe-actions";
import { PaymentInstrument } from "../../../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { RawCreditCardPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { addPrivativeToWallet, walletAddPrivativeStart } from "../actions";

export type AddingPrivativeState = {
  addingResult: RemoteValue<RawCreditCardPaymentMethod, NetworkError>;
  selectedPrivative?: PaymentInstrument;
};

const initialState: AddingPrivativeState = {
  addingResult: remoteUndefined
};

const addingPrivativeReducer = (
  state: AddingPrivativeState = initialState,
  action: Action
): AddingPrivativeState => {
  switch (action.type) {
    case getType(addPrivativeToWallet.request):
      return {
        selectedPrivative: action.payload,
        addingResult: remoteLoading
      };
    case getType(addPrivativeToWallet.success):
      return {
        ...state,
        addingResult: remoteReady(action.payload)
      };
    case getType(addPrivativeToWallet.failure):
      return {
        ...state,
        addingResult: remoteError(action.payload)
      };
    case getType(walletAddPrivativeStart):
      return initialState;
  }
  return state;
};

export const onboardingPrivativeChosenSelector = (
  state: GlobalState
): PaymentInstrument | undefined =>
  state.wallet.onboarding.privative.addingPrivative.selectedPrivative;

export const onboardingPrivativeAddingResultSelector = (
  state: GlobalState
): RemoteValue<RawCreditCardPaymentMethod, NetworkError> =>
  state.wallet.onboarding.privative.addingPrivative.addingResult;

export default addingPrivativeReducer;
