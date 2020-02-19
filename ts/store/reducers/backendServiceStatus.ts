/**
 * Implements the reducers for BackendInfo.
 */

import { Action } from "../actions/types";

import { getType } from "typesafe-actions";
import { backendServicesStatus } from "../actions/backendServicesStatus";

export type BackendServicesState = boolean;

const initialBackendInfoState: BackendServicesState = true;

export default function backendInfo(
  state: BackendServicesState = initialBackendInfoState,
  action: Action
): BackendServicesState {
  switch (action.type) {
    case getType(backendServicesStatus):
      return action.payload;

    default:
      return state;
  }
}
