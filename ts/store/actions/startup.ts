import { ActionType, createStandardAction } from "typesafe-actions";
import { StartupStatusEnum, StartupTransientError } from "../reducers/startup";

export const startupLoadSuccess = createStandardAction(
  "STARTUP_LOAD_SUCCESS"
)<StartupStatusEnum>();

export const startupTransientError = createStandardAction(
  "STARTUP_TRANSIENT_ERROR"
)<StartupTransientError>();

export type StartupActions =
  | ActionType<typeof startupLoadSuccess>
  | ActionType<typeof startupTransientError>;
