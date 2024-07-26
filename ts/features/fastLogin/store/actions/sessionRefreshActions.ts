import { ActionType, createStandardAction } from "typesafe-actions";
import { FastLoginSessionRefreshState } from "../reducers/sessionRefreshReducer";

export const setFastLoginSessionRefresh = createStandardAction(
  "SET_FAST_LOGIN_SESSION_REFRESH"
)<FastLoginSessionRefreshState>();

export type fastLoginSessionRefreshActions = ActionType<
  typeof setFastLoginSessionRefresh
>;
