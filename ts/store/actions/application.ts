import { AppStateStatus } from "react-native";
// eslint-disable-next-line @jambit/typed-redux-saga/use-typed-effects
import { ActionPattern } from "redux-saga/effects";
import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Action types and action creator related to the Application.
 */
type ApplicationInitializationPayload = {
  handleSessionExpiration?: boolean;
  showIdentificationModalAtStartup?: boolean;
} | void;
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
  | ActionType<typeof startApplicationInitialization>
  | ActionType<typeof applicationChangeState>;
