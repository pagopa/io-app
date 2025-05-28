import { ActionType, createStandardAction } from "typesafe-actions";

export const requestConnectionStatus = createStandardAction(
  "REQUEST_CONNECTION_STATUS"
)();

export const setConnectionStatus = createStandardAction(
  "SET_CONNECTION_STATUS"
)<boolean>();

export type ConnectivityActions =
  | ActionType<typeof requestConnectionStatus>
  | ActionType<typeof setConnectionStatus>;
