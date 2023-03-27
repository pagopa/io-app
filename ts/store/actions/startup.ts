import { ActionType, createStandardAction } from "typesafe-actions";
import { StartupStatusEnum } from "../reducers/startup";

export const startupLoadSuccess = createStandardAction(
  "STARTUP_LOAD_SUCCESS"
)<StartupStatusEnum>();

export type StartupActions = ActionType<typeof startupLoadSuccess>;
