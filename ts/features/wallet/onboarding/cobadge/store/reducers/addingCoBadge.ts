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
import { addCoBadgeToWallet, walletAddCoBadgeStart } from "../actions";

export type AddingCoBadgeState = {
  addingResult: RemoteValue<RawCreditCardPaymentMethod, NetworkError>;
  selectedCoBadge?: PaymentInstrument;
};

const initialState: AddingCoBadgeState = {
  addingResult: remoteUndefined
};

const addingCoBadgeReducer = (
  state: AddingCoBadgeState = initialState,
  action: Action
): AddingCoBadgeState => {
  switch (action.type) {
    case getType(addCoBadgeToWallet.request):
      return {
        selectedCoBadge: action.payload,
        addingResult: remoteLoading
      };
    case getType(addCoBadgeToWallet.success):
      return {
        ...state,
        addingResult: remoteReady(action.payload)
      };
    case getType(addCoBadgeToWallet.failure):
      return {
        ...state,
        addingResult: remoteError(action.payload)
      };
    case getType(walletAddCoBadgeStart):
      return initialState;
  }
  return state;
};

export const onboardingCobadgeChosenSelector = (
  state: GlobalState
): PaymentInstrument | undefined =>
  state.wallet.onboarding.coBadge.addingCoBadge.selectedCoBadge;

export const onboardingCobadgeAddingResultSelector = (
  state: GlobalState
): RemoteValue<RawCreditCardPaymentMethod, NetworkError> =>
  state.wallet.onboarding.coBadge.addingCoBadge.addingResult;

export default addingCoBadgeReducer;
