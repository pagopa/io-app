import { ActionType, createStandardAction } from "typesafe-actions";

export const setIsBlockingScreen = createStandardAction(
  "SET_IS_BLOCKING_SCREEN"
)();

export type IngressScreenActions = ActionType<typeof setIsBlockingScreen>;
