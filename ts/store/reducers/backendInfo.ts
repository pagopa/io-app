/**
 * Implements the reducers for BackendInfo.
 */

import { Action } from "../actions/types";

import { getType } from "typesafe-actions";
import { ServerInfo } from "../../../definitions/backend/ServerInfo";
import {
  backendInfoLoadFailure,
  backendInfoLoadSuccess
} from "../actions/backendInfo";

export type BackendInfoState = Readonly<{
  serverInfo?: ServerInfo;
}>;

const initialBackendInfoState: BackendInfoState = {
  serverInfo: undefined
};

export default function backendInfo(
  state: BackendInfoState = initialBackendInfoState,
  action: Action
): BackendInfoState {
  switch (action.type) {
    case getType(backendInfoLoadSuccess):
      return {
        ...state,
        serverInfo: action.payload
      };

    case getType(backendInfoLoadFailure):
      return {
        ...state,
        serverInfo: undefined
      };

    default:
      return state;
  }
}
