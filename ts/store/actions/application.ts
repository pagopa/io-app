import {
  APP_STATE_CHANGE_ACTION,
  START_APPLICATION_INITIALIZATION
} from "./constants";
import { ApplicationState } from "./types";

/**
 * Action types and action creator related to the Application.
 */

export type StartApplicationInitialization = Readonly<{
  type: typeof START_APPLICATION_INITIALIZATION;
}>;

export const startApplicationInitialization: StartApplicationInitialization = {
  type: START_APPLICATION_INITIALIZATION
};

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

export type ApplicationActions = StartApplicationInitialization;
