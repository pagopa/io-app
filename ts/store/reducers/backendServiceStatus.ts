/**
 * Implements the reducers for BackendServicesState.
 */

import { Action } from "../actions/types";

import { none, Option, some } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { BackendServicesStatus } from "../../api/backendPublic";
import { backendServicesStatus } from "../actions/backendServicesStatus";
import { GlobalState } from "./types";

/** note that this state is not persisted so Option type is accepted
 * if you want to persist an option take care of persinsting/rehydrating
 * see https://www.pivotaltracker.com/story/show/170998374
 */
const initialBackendInfoState: Option<BackendServicesStatus> = none;

export const backendInfoSelector = (
  state: GlobalState
): Option<BackendServicesStatus> => state.backendServicesStatus;

export default function backendInfo(
  state: Option<BackendServicesStatus> = initialBackendInfoState,
  action: Action
): Option<BackendServicesStatus> {
  switch (action.type) {
    case getType(backendServicesStatus):
      return some(action.payload);

    default:
      return state;
  }
}
