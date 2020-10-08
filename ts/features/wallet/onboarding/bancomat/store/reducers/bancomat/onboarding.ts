import { getType } from "typesafe-actions";
import {
  getValueOrElse,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../../bonus/bpd/model/RemoteValue";
import { Action } from "../../../../../../../store/actions/types";
import { loadPans } from "../../actions";
import { PatchedCard } from "../../../../../../bonus/bpd/api/patchedTypes";
import { GlobalState } from "../../../../../../../store/reducers/types";

type Pans = RemoteValue<ReadonlyArray<PatchedCard>, Error>;

// 'pans' holds cards array derived from pans search
export type OnboardingState = {
  pans: Pans;
};

const oboardingInitialState = { pans: remoteUndefined };

const onboardingReducer = (
  state: OnboardingState = oboardingInitialState,
  action: Action
): OnboardingState => {
  switch (action.type) {
    case getType(loadPans.request):
      return { ...state, pans: remoteLoading };
    case getType(loadPans.success):
      return { ...state, pans: remoteReady(action.payload) };
    case getType(loadPans.failure):
      return { ...state, pans: remoteError(action.payload) };
  }
  return state;
};

export const onboardingPansSelector = (
  state: GlobalState
): ReadonlyArray<PatchedCard> =>
  getValueOrElse(state.wallet.bancomat.onboarding.pans, []);

export default onboardingReducer;
