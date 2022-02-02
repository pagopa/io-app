import { ActionType, createStandardAction } from "typesafe-actions";
import { IOVersionInfo } from "../../types/IOVersionInfo";

export const versionInfoLoadFailure = createStandardAction(
  "VERSION_INFO_LOAD_FAILURE"
)<Error>();

export const versionInfoLoadSuccess = createStandardAction(
  "VERSION_INFO_LOAD_SUCCESS"
)<IOVersionInfo>();

export type VersionInfoActions = ActionType<
  typeof versionInfoLoadFailure | typeof versionInfoLoadSuccess
>;
