/**
 * Implements the reducers for BackendServicesState.
 */

import { Action } from "../actions/types";

import { none, Option, some } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { BackendServicesStatus } from "../../api/backendPublic";
import { backendServicesStatusLoadSuccess } from "../actions/backendServicesStatus";
import { GlobalState } from "./types";

/** note that this state is not persisted so Option type is accepted
 * if you want to persist an option take care of persinsting/rehydrating
 * see https://www.pivotaltracker.com/story/show/170998374
 */
export type BackendServicesStatusState = Option<BackendServicesStatus>;
const initialBackendInfoState: BackendServicesStatusState = none;

export const backendInfoSelector = (
  state: GlobalState
): BackendServicesStatusState => state.backendServicesStatus;

export default function backendInfo(
  state: BackendServicesStatusState = initialBackendInfoState,
  action: Action
): BackendServicesStatusState {
  switch (action.type) {
    case getType(backendServicesStatusLoadSuccess):
      return some(action.payload);

    default:
      return state;
  }
}
