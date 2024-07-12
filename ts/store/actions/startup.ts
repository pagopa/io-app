import { ActionType, createStandardAction } from "typesafe-actions";
import {
  StartupStatusEnum,
  StartupTransientErrorEnum
} from "../reducers/startup";

export const startupLoadSuccess = createStandardAction(
  "STARTUP_LOAD_SUCCESS"
)<StartupStatusEnum>();

export const startupTransientError = createStandardAction(
  "STARTUP_TRANSIENT_ERROR"
)<StartupTransientErrorEnum>();

export type StartupActions =
  | ActionType<typeof startupLoadSuccess>
  | ActionType<typeof startupTransientError>;
