/**
 * Action types and action creator related to InstabugInfo.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const requestInstabugInfoLoad = createStandardAction(
  "REQUEST_INSTABUG_INFO_LOAD"
)();

export const responseInstabugInfoLoaded = createStandardAction(
  "RESPONSE_INSTABUG_INFO_LOADED"
)<number>();

export type InstabugInfoActions =
  | ActionType<typeof requestInstabugInfoLoad>
  | ActionType<typeof responseInstabugInfoLoaded>;
