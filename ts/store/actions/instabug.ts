/**
 * Action types and action creator related to InstabugInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const requestIstabugInfoLoad = createStandardAction(
  "REQUEST_INSTABUG_INFO_LOAD"
)();

export const instabugInfoLoaded = createStandardAction("INSTABUG_INFO_LOAD")<
  number
>();

export type InstabugInfoActions =
  | ActionType<typeof requestIstabugInfoLoad>
  | ActionType<typeof instabugInfoLoaded>;
