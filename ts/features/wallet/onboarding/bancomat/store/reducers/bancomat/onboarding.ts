import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../../bonus/bpd/model/RemoteValue";
import { Action } from "../../../../../../../store/actions/types";
import { loadPans } from "../../actions";
import { PatchedCard } from "../../../../../../bonus/bpd/api/patchedTypes";

// 'pans' holds cards array derived from pans search
export type OnboardingState = {
  pans: RemoteValue<ReadonlyArray<PatchedCard>, Error>;
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

export default onboardingReducer;
