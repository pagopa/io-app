import { ActionType, createStandardAction } from "typesafe-actions";

export type StartupStatus = "initial" | "notAuthenticated" | "authenticated";

export const startupLoadSuccess = createStandardAction(
  "STARTUP_LOAD_SUCCESS"
)<StartupStatus>();

export type StartupActions = ActionType<typeof startupLoadSuccess>;
