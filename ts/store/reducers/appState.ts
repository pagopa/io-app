/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 */

import { isActionOf } from "typesafe-actions";

import {
  applicationChangeState,
  ApplicationState
} from "../actions/application";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type AppState = Readonly<{
  appState: ApplicationState;
}>;

export const initialAppState: AppState = {
  appState: "background"
};

export const appStateSelector = (state: GlobalState): AppState =>
  state.appState;

export default function appState(
  state: AppState = initialAppState,
  action: Action
): AppState {
  if (isActionOf(applicationChangeState, action)) {
    return {
      ...state,
      appState: action.payload
    };
  }
  return state;
}
