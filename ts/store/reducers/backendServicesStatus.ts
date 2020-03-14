/**
 * Implements the reducers for BackendServicesState.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BackendServicesStatus } from "../../api/backendPublic";
import { backendServicesStatusLoadSuccess } from "../actions/backendServicesStatus";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

/** note that this state is not persisted so Option type is accepted
 * if you want to persist an option take care of persinsting/rehydrating
 * see https://www.pivotaltracker.com/story/show/170998374
 */
export type BackendServicesStatusState = {
  status: Option<BackendServicesStatus>;
  areSystemsDead: boolean;
  deadsCounter: number;
};
const initialBackendInfoState: BackendServicesStatusState = {
  status: none,
  areSystemsDead: false,
  deadsCounter: 0
};

export const backendServicesStatusSelector = (
  state: GlobalState
): BackendServicesStatusState => state.backendServicesStatus;

// this is a constant applied to know if systeam are dead or know
// since we receive the date some time could be elpased due to network delay
const C_TOLERANCE = (20 * 1000) as Millisecond;

// systems could be consider dead when we have no updates for at least DEAD_COUNTER_THRESHOLD times
export const DEAD_COUNTER_THRESHOLD = 2;

// true if we have data and it says backend is off
export const isBackendServicesStatusOffSelector = createSelector(
  backendServicesStatusSelector,
  bss => bss.areSystemsDead
);

export const areSystemsDeadReducer = (
  currentState: BackendServicesStatusState,
  backendServicesStatus: BackendServicesStatus
): BackendServicesStatusState => {
  // we considering refresh timeout + a constant to evaluate the time
  // must be exceeded to say backend system are dead or not
  const refreshTimeout =
    (backendServicesStatus.refresh_timeout as number) + (C_TOLERANCE as number);
  const areSystemsDead =
    new Date().getTime() - backendServicesStatus.last_update.getTime() >
    refreshTimeout;
  const deadsCounter = areSystemsDead ? currentState.deadsCounter + 1 : 0;
  return {
    ...currentState,
    status: some(backendServicesStatus),
    areSystemsDead: deadsCounter >= DEAD_COUNTER_THRESHOLD,
    deadsCounter
  };
};

export default function backendServicesStatusReducer(
  state: BackendServicesStatusState = initialBackendInfoState,
  action: Action
): BackendServicesStatusState {
  if (action.type === getType(backendServicesStatusLoadSuccess)) {
    return areSystemsDeadReducer(state, action.payload);
  }
  return state;
}
