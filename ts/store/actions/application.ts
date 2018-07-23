import { APP_STATE_CHANGE_ACTION, APPLICATION_INITIALIZED } from "./constants";
import { ApplicationState } from "./types";

/**
 * Action types and action creator related to the Application.
 */

export type ApplicationInitialized = Readonly<{
  type: typeof APPLICATION_INITIALIZED;
}>;

export const applicationInitialized = (): ApplicationInitialized => ({
  type: APPLICATION_INITIALIZED
});

export type ApplicationChangeState = Readonly<{
  type: typeof APP_STATE_CHANGE_ACTION;
  payload: ApplicationState;
}>;

export const applicationChangeState = (
  activity: ApplicationState
): ApplicationChangeState => ({
  type: APP_STATE_CHANGE_ACTION,
  payload: activity
});

export type ApplicationActions = ApplicationInitialized;
