import {
  CLEAR_DEFERRED_NAVIGATION_ACTION,
  NAVIGATE_IF_LOGGED_IN,
  SAVE_NAVIGATION_STATE,
  SAVE_NAVIGATION_WHEN_LOGGED_IN
} from "./constants";
import { Action } from "./types";

export interface NavigateIfLoggedIn {
  type: typeof NAVIGATE_IF_LOGGED_IN;
  payload: Action;
}

export const navigateIfLoggedIn = (action: Action): NavigateIfLoggedIn => ({
  type: NAVIGATE_IF_LOGGED_IN,
  payload: action
});

export interface SaveNavigationState {
  type: typeof SAVE_NAVIGATION_STATE;
  payload: Action;
}

export const saveNavigationState = (action: Action): SaveNavigationState => ({
  type: SAVE_NAVIGATION_STATE,
  payload: action
});

export interface SaveNavigationWhenLoggedIn {
  type: typeof SAVE_NAVIGATION_WHEN_LOGGED_IN;
  payload: Action;
}

export const saveNavigationWhenLoggedIn = (
  action: Action
): SaveNavigationWhenLoggedIn => ({
  type: SAVE_NAVIGATION_WHEN_LOGGED_IN,
  payload: action
});

export interface ClearDeferredNavigationAction {
  type: typeof CLEAR_DEFERRED_NAVIGATION_ACTION;
}

export const clearDeferredNavigationAction = (): ClearDeferredNavigationAction => ({
  type: CLEAR_DEFERRED_NAVIGATION_ACTION
});

export type DeferredNavigationActions =
  | NavigateIfLoggedIn
  | SaveNavigationState
  | SaveNavigationWhenLoggedIn
  | ClearDeferredNavigationAction;
