/**
 * Action types and action creator related to InstabugInfo.
 */
import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServerInfo } from "../../../definitions/backend/ServerInfo";

export const instabugInfoLoad = createAsyncAction(
  "INITIAL_INFO_LOAD_REQUEST",
  "INSTABUG_INFO_LOAD_SUCCESS",
  "INSTABUG_INFO_LOAD_FAILURE"
)<void, ServerInfo, Error>();

export type InstabugInfoActions = ActionType<typeof instabugInfoLoad>;
