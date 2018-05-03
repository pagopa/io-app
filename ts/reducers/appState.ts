/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 */

import { Action, ApplicationState } from "../actions/types";
import { APP_STATE_CHANGE_ACTION } from "../store/actions/constants";

export type AppState = Readonly<{
  appState: ApplicationState;
}>;

export const initialAppState: AppState = {
  appState: "background"
};

export default function appState(
  state: AppState = initialAppState,
  action: Action
): AppState {
  if (action.type === APP_STATE_CHANGE_ACTION) {
    return {
      ...state,
      appState: action.payload
    };
  }
  return state;
}
