/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 */

import { APP_STATE_CHANGE_ACTION } from "../actions/constants";
import { Action, ApplicationState } from "../actions/types";
import { GlobalState } from "./types";

export type AppState = Readonly<{
  appState: ApplicationState;
}>;

export const initialAppState: AppState = {
  appState: "background"
};

export const applicationStateSelector = (
  state: GlobalState
): ApplicationState => state.appState.appState;

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
