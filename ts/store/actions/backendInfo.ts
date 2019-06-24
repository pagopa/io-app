/**
 * Action types and action creator related to BackendInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

import { ServerInfo } from "../../../definitions/backend/ServerInfo";

export const backendInfoLoadFailure = createStandardAction(
  "BACKEND_INFO_LOAD_FAILURE"
)<string>();

export const backendInfoLoadSuccess = createStandardAction(
  "BACKEND_INFO_LOAD_SUCCESS"
)<ServerInfo>();

export type BackendInfoActions = ActionType<
  typeof backendInfoLoadFailure | typeof backendInfoLoadSuccess
>;
