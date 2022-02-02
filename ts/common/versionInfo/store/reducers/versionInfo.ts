/**
 * Implements the reducers for BackendInfo.
 */

import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { IOVersionInfo } from "../../types/IOVersionInfo";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../actions/versionInfo";

export type BackendInfoState = Readonly<{
  serverInfo?: IOVersionInfo;
}>;

const initialBackendInfoState: BackendInfoState = {
  serverInfo: undefined
};

export default function versionInfo(
  state: BackendInfoState = initialBackendInfoState,
  action: Action
): BackendInfoState {
  switch (action.type) {
    case getType(versionInfoLoadSuccess):
      return {
        ...state,
        serverInfo: action.payload
      };

    case getType(versionInfoLoadFailure):
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
