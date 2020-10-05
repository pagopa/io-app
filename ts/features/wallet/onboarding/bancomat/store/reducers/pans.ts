import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../bonus/bpd/model/RemoteValue";
import { Action } from "../../../../../../store/actions/types";
import { loadPans } from "../actions";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";

// 'search' holds cards array derived from pans search
export type PansState = {
  search: RemoteValue<ReadonlyArray<PatchedCard>, Error>;
};

const initialState: PansState = { search: remoteUndefined };

const pansReducer = (
  state: PansState = initialState,
  action: Action
): PansState => {
  switch (action.type) {
    case getType(loadPans.request):
      return { ...state, search: remoteLoading };
    case getType(loadPans.success):
      return { ...state, search: remoteReady(action.payload) };
    case getType(loadPans.failure):
      return { ...state, search: remoteError(action.payload) };
  }
  return state;
};

export default pansReducer;
