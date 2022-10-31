import { ActionType, createStandardAction } from "typesafe-actions";

export const startupLoadSuccess = createStandardAction(
  "STARTUP_LOAD_SUCCESS"
)<boolean>();

export type StartupActions = ActionType<typeof startupLoadSuccess>;
