import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

/**
 * Action types and action creator related to the Application.
 */

export const startApplicationInitialization = createAction(
  "START_APPLICATION_INITIALIZATION"
);

export type ApplicationState = "background" | "inactive" | "active";

export const applicationChangeState = createStandardAction(
  "APP_STATE_CHANGE_ACTION"
)<ApplicationState>();

export type ApplicationActions =
  | ActionType<typeof startApplicationInitialization>
  | ActionType<typeof applicationChangeState>;
