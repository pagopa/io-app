/**
 * Implements the reducers for BackendInfo.
 */

import { getType } from "typesafe-actions";
import { ServerInfo } from "../../../definitions/backend/ServerInfo";
import {
  backendInfoLoadFailure,
  backendInfoLoadSuccess
} from "../actions/backendInfo";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

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

// Selectors
export const serverInfoDataSelector = (state: GlobalState) =>
  state.backendInfo.serverInfo;
