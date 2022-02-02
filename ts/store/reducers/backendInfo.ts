/**
 * Implements the reducers for BackendInfo.
 */

import { getType } from "typesafe-actions";
import {
  backendInfoLoadFailure,
  backendInfoLoadSuccess
} from "../actions/backendInfo";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type IOVersionInfo = {
  min_app_version: IOVersionPerPlatform;
  latest_released_app_version: IOVersionPerPlatform;
  rollout_app_version: IOVersionPerPlatform;
  min_app_version_pagopa?: IOVersionPerPlatform;
};

export type IOVersionPerPlatform = {
  ios: string;
  android: string;
};

export type BackendInfoState = Readonly<{
  serverInfo?: IOVersionInfo;
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
