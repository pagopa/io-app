import { AppStateStatus } from "react-native";
// eslint-disable-next-line no-restricted-imports
import { ActionPattern } from "redux-saga/effects";
import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Action types and action creator related to the Application.
 */
type ApplicationInitializationPayload = void | {
  handleSessionExpiration?: boolean;
  isActiveLoginSuccess?: boolean;
  showIdentificationModalAtStartup?: boolean;
};
export const startApplicationInitialization = createStandardAction(
  "START_APPLICATION_INITIALIZATION"
)<ApplicationInitializationPayload>();

type ApplicationInitializedPayload = {
  actionsToWaitFor: Array<ActionPattern>;
};
export const applicationInitialized = createStandardAction(
  "APPLICATION_INITIALIZED_ACTION"
)<ApplicationInitializedPayload>();

export const applicationChangeState = createStandardAction(
  "APP_STATE_CHANGE_ACTION"
)<AppStateStatus>();

export type ApplicationActions =
  | ActionType<typeof applicationChangeState>
  | ActionType<typeof applicationInitialized>
  | ActionType<typeof startApplicationInitialization>;
