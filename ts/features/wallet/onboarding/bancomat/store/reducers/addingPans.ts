import { getType } from "typesafe-actions";
import { Card } from "../../../../../../../definitions/pagopa/walletv2/Card";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { RawBancomatPaymentMethod } from "../../../../../../types/pagopa";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { addBancomatToWallet, walletAddBancomatStart } from "../actions";

export type AddingPansState = {
  addingResult: RemoteValue<RawBancomatPaymentMethod, Error>;
  selectedPan?: Card;
};

const initialState: AddingPansState = {
  addingResult: remoteUndefined
};

const addingPansReducer = (
  state: AddingPansState = initialState,
  action: Action
): AddingPansState => {
  switch (action.type) {
    case getType(addBancomatToWallet.request):
      return {
        selectedPan: action.payload,
        addingResult: remoteLoading
      };
    case getType(addBancomatToWallet.success):
      return {
        ...state,
        addingResult: remoteReady(action.payload)
      };
    case getType(addBancomatToWallet.failure):
      return {
        ...state,
        addingResult: remoteError(action.payload)
      };
    case getType(walletAddBancomatStart):
      return initialState;
  }
  return state;
};

export const onboardingBancomatChosenPanSelector = (
  state: GlobalState
): Card | undefined => state.wallet.onboarding.bancomat.addingPans.selectedPan;

export const onboardingBancomatAddingResultSelector = (
  state: GlobalState
): RemoteValue<RawBancomatPaymentMethod, Error> =>
  state.wallet.onboarding.bancomat.addingPans.addingResult;

export default addingPansReducer;
