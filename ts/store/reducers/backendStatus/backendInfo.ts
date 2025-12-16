import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../actions/types";
import { backendStatusLoadSuccess } from "../../actions/backendStatus";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { GlobalState } from "../types";

// systems could be consider dead when we have no updates for at least DEAD_COUNTER_THRESHOLD times
export const DEAD_COUNTER_THRESHOLD = 2;

export type BackedInfoState = {
  backendInfoMessage: O.Option<BackendStatus["message"]>;
  areSystemsDead: boolean;
  deadsCounter: number;
};

const initialBackendInfoState: BackedInfoState = {
  backendInfoMessage: O.none,
  areSystemsDead: false,
  deadsCounter: 0
};

export const backendInfoReducer = (
  state: BackedInfoState = initialBackendInfoState,
  action: Action
): BackedInfoState => {
  if (action.type === getType(backendStatusLoadSuccess)) {
    const deadsCounter =
      action.payload.is_alive === false
        ? Math.min(state.deadsCounter + 1, DEAD_COUNTER_THRESHOLD)
        : 0;
    return {
      ...state,
      backendInfoMessage: O.some(action.payload.message),
      areSystemsDead: deadsCounter >= DEAD_COUNTER_THRESHOLD,
      deadsCounter
    };
  }
  return state;
};

export const deadsCounterSelector = (state: GlobalState) =>
  state.backendInfo.deadsCounter;

// true if we have data and it says backend is off
export const isBackendServicesStatusOffSelector = (state: GlobalState) =>
  state.backendInfo.areSystemsDead;

export const backendInfoMessageSelector = (state: GlobalState) =>
  pipe(state.backendInfo.backendInfoMessage, O.toUndefined);
