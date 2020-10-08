import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import {
  isError,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { LoadPansError } from "../../saga/networking";
import { loadPans } from "../actions";

export type Pans = RemoteValue<ReadonlyArray<PatchedCard>, LoadPansError>;

const pansReducer = (state: Pans = remoteUndefined, action: Action): Pans => {
  switch (action.type) {
    case getType(loadPans.request):
      return remoteLoading;
    case getType(loadPans.success):
      return remoteReady(action.payload);
    case getType(loadPans.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const onboardingBancomatFoundPansSelector = (state: GlobalState): Pans =>
  state.wallet.onboarding.bancomat.foundPans;

export const onboardingBancomatPansIsError = (state: GlobalState): boolean =>
  isError(state.wallet.onboarding.bancomat.foundPans);

export default pansReducer;
