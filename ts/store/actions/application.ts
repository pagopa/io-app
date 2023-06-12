import { AppStateStatus } from "react-native";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

/**
 * Action types and action creator related to the Application.
 */
type ApplicationInitializationPayload = {
  handleSessionExpiration?: boolean;
} | void;
export const startApplicationInitialization = createStandardAction(
  "START_APPLICATION_INITIALIZATION"
)<ApplicationInitializationPayload>();
export const applicationInitialized = createAction(
  "APPLICATION_INITIALIZED_ACTION"
);

export const applicationChangeState = createStandardAction(
  "APP_STATE_CHANGE_ACTION"
)<AppStateStatus>();

export type ApplicationActions =
  | ActionType<typeof startApplicationInitialization>
  | ActionType<typeof applicationChangeState>;
