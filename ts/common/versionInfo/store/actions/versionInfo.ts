/**
 * Action types and action creator related to BackendInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { IOVersionInfo } from "../reducers/versionInfo";

export const versionInfoLoadFailure = createStandardAction(
  "VERSION_INFO_LOAD_FAILURE"
)<Error>();

export const versionInfoLoadSuccess = createStandardAction(
  "VERSION_INFO_LOAD_SUCCESS"
)<IOVersionInfo>();

export type VersionInfoActions = ActionType<
  typeof versionInfoLoadFailure | typeof versionInfoLoadSuccess
>;
