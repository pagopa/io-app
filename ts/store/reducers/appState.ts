/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 */

import { AppStateStatus } from "react-native";
import { isActionOf } from "typesafe-actions";

import { applicationChangeState } from "../actions/application";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type AppState = Readonly<{
  appState: AppStateStatus;
}>;

export const initialAppState: AppState = {
  appState: "background"
};

export const appStateSelector = (state: GlobalState): AppState =>
  state.appState;

export const appCurrentStateSelector = (state: GlobalState) =>
  state.appState.appState;

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
