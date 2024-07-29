import { ActionType, createStandardAction } from "typesafe-actions";
import { AutomaticSessionRefreshState } from "../reducers/sessionRefreshReducer";

export const setAutomaticSessionRefresh = createStandardAction(
  "SET_AUTOMATIC_SESSION_REFRESH_AFTER_TWO_MIN_BACKGROUND"
)<AutomaticSessionRefreshState>();

export type automaticSessionRefreshActions = ActionType<
  typeof setAutomaticSessionRefresh
>;
