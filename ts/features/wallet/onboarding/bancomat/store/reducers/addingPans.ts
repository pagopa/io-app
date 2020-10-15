import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { walletAddSelectedBancomat } from "../actions";

export type AddingPansState = {
  addingResult: RemoteValue<void, Error>;
  selectedPan?: PatchedCard;
};

const initialState: AddingPansState = {
  addingResult: remoteUndefined
};

const addingPansReducer = (
  state: AddingPansState = initialState,
  action: Action
): AddingPansState => {
  switch (action.type) {
    case getType(walletAddSelectedBancomat.request):
      return {
        selectedPan: action.payload,
        addingResult: remoteLoading
      };
    case getType(walletAddSelectedBancomat.success):
      return {
        ...state,
        addingResult: remoteReady(action.payload)
      };
    case getType(walletAddSelectedBancomat.failure):
      return {
        ...state,
        addingResult: remoteError(action.payload)
      };
  }
  return state;
};

export const onboardingBancomatChosenPanSelector = (
  state: GlobalState
): PatchedCard | undefined =>
  state.wallet.onboarding.bancomat.addingPans.selectedPan;

export const onboardingBancomatAddingResultSelector = (
  state: GlobalState
): RemoteValue<void, Error> =>
  state.wallet.onboarding.bancomat.addingPans.addingResult;

export default addingPansReducer;
