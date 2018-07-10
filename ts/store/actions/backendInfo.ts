/**
 * Action types and action creator related to BackendInfo.
 */

import { ServerInfo } from "../../../definitions/backend/ServerInfo";
import {
  BACKEND_INFO_LOAD_FAILURE,
  BACKEND_INFO_LOAD_SUCCESS
} from "./constants";

export type BackendInfoLoadFailure = Readonly<{
  type: typeof BACKEND_INFO_LOAD_FAILURE;
  payload: Error;
  error: true;
}>;

export type BackendInfoLoadSuccess = Readonly<{
  type: typeof BACKEND_INFO_LOAD_SUCCESS;
  payload: ServerInfo;
}>;

export type BackendInfoActions =
  | BackendInfoLoadFailure
  | BackendInfoLoadSuccess;

// Creators

export const backendInfoLoadFailure = (
  error: Error
): BackendInfoLoadFailure => ({
  type: BACKEND_INFO_LOAD_FAILURE,
  payload: error,
  error: true
});

export const backendInfoLoadSuccess = (
  serverInfo: ServerInfo
): BackendInfoLoadSuccess => ({
  type: BACKEND_INFO_LOAD_SUCCESS,
  payload: serverInfo
});
