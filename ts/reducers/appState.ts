/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 */

import { ApplicationState, ApplicationStateAction } from "../actions/types";
import { APP_STATE_CHANGE_ACTION } from "../store/actions/constants";

export type AppState = {
  appState: ApplicationState;
};

export const initialAppState: AppState = {
  appState: "background"
};

export default function appState(
  state: AppState = initialAppState,
  action: ApplicationStateAction
): AppState {
  if (action.type === APP_STATE_CHANGE_ACTION) {
    return {
      ...state,
      appState: action.payload
    };
  }
  return state;
}
