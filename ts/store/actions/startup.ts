import { ActionType, createStandardAction } from "typesafe-actions";

export enum StartupStatusEnum {
  INITIAL = "initial",
  ONBOARDING = "onboarding",
  NOT_AUTHENTICATED = "notAuthenticated",
  AUTHENTICATED = "authenticated"
}

export const startupLoadSuccess = createStandardAction(
  "STARTUP_LOAD_SUCCESS"
)<StartupStatusEnum>();

export type StartupActions = ActionType<typeof startupLoadSuccess>;
