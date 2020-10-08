import { getType } from "typesafe-actions";
import {
  getValueOrElse,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { Action } from "../../../../../../store/actions/types";
import { loadPans } from "../actions";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";
import { GlobalState } from "../../../../../../store/reducers/types";

export type Pans = RemoteValue<ReadonlyArray<PatchedCard>, Error>;

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

export const onboardingBancomatFoundPansSelector = (
  state: GlobalState
): ReadonlyArray<PatchedCard> =>
  getValueOrElse(state.wallet.onboarding.bancomat.foundPans, []);

export default pansReducer;
