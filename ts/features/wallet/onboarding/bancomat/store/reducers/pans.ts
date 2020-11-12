import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { LoadPansError } from "../../saga/networking";
import { PansResponse, searchUserPans } from "../actions";

export type Pans = RemoteValue<PansResponse, LoadPansError>;

const pansReducer = (state: Pans = remoteUndefined, action: Action): Pans => {
  switch (action.type) {
    case getType(searchUserPans.request):
      return remoteLoading;
    case getType(searchUserPans.success):
      return remoteReady(action.payload);
    case getType(searchUserPans.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const onboardingBancomatFoundPansSelector = (state: GlobalState): Pans =>
  state.wallet.onboarding.bancomat.foundPans;

export const onboardingBancomatPansIsError = (state: GlobalState): boolean =>
  isError(state.wallet.onboarding.bancomat.foundPans);

export default pansReducer;
