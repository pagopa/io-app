/**
 * Implements the reducers for BackendInfo.
 */

import {
  BACKEND_INFO_LOAD_FAILURE,
  BACKEND_INFO_LOAD_SUCCESS
} from "../actions/constants";
import { Action } from "../actions/types";

import { ServerInfo } from "../../../definitions/backend/ServerInfo";

export type BackendInfoState = Readonly<{
  serverInfo: ServerInfo | undefined;
}>;

export const initialBackendInfoState: BackendInfoState = {
  serverInfo: undefined
};

export default function backendInfo(
  state: BackendInfoState = initialBackendInfoState,
  action: Action
): BackendInfoState {
  if (action.type === BACKEND_INFO_LOAD_SUCCESS) {
    return {
      ...state,
      serverInfo: action.payload
    };
  } else if (action.type === BACKEND_INFO_LOAD_FAILURE) {
    return {
      ...state,
      serverInfo: undefined
    };
  }
  return state;
}
