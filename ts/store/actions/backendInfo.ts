/**
 * Action types and action creator related to BackendInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { IOVersionInfo } from "../reducers/backendInfo";

export const backendInfoLoadFailure = createStandardAction(
  "BACKEND_INFO_LOAD_FAILURE"
)<Error>();

export const backendInfoLoadSuccess = createStandardAction(
  "BACKEND_INFO_LOAD_SUCCESS"
)<IOVersionInfo>();

export type BackendInfoActions = ActionType<
  typeof backendInfoLoadFailure | typeof backendInfoLoadSuccess
>;
