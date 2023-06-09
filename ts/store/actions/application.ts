import { AppStateStatus } from "react-native";
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
export const applicationInitialized = createAction(
  "APPLICATION_INITIALIZED_ACTION"
);

export const applicationChangeState = createStandardAction(
  "APP_STATE_CHANGE_ACTION"
)<AppStateStatus>();

export type ApplicationActions =
  | ActionType<typeof startApplicationInitialization>
  | ActionType<typeof applicationChangeState>;
