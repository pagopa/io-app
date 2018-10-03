/**
 * Action types and action creator related to BackendInfo.
 */
import { ActionType, createAction } from "typesafe-actions";

import { ServerInfo } from "../../../definitions/backend/ServerInfo";

export const backendInfoLoadFailure = createAction(
  "BACKEND_INFO_LOAD_FAILURE",
  resolve => (error: Error) => resolve(error)
);

export const backendInfoLoadSuccess = createAction(
  "BACKEND_INFO_LOAD_SUCCESS",
  resolve => (serverInfo: ServerInfo) => resolve(serverInfo)
);

export type BackendInfoActions = ActionType<
  typeof backendInfoLoadFailure | typeof backendInfoLoadSuccess
>;
