/**
 * Action types and action creators related to deferred actions.
 * A deferred action is an action dispatched before the user login
 * but actually has to be dispatched once the has been logged in.
 * (e.g. navigation coming from push notification or from deep link happened
 * while the app is not in foreground and/or the user is not logged in)
 */

import {
  CLEAR_DEFERRED_ACTIONS,
  DEFER_TO_LOGIN,
  PUSH_TO_DEFERRED_ACTIONS
} from "./constants";
import { Action } from "./types";

export interface DeferToLogin {
  type: typeof DEFER_TO_LOGIN;
  payload: Action;
}

export const deferToLogin = (action: Action): DeferToLogin => ({
  type: DEFER_TO_LOGIN,
  payload: action
});

export interface PushToDeferredActions {
  type: typeof PUSH_TO_DEFERRED_ACTIONS;
  payload: Action;
}

export const pushToDeferredActions = (
  action: Action
): PushToDeferredActions => ({
  type: PUSH_TO_DEFERRED_ACTIONS,
  payload: action
});

export interface ClearDeferredActions {
  type: typeof CLEAR_DEFERRED_ACTIONS;
}

export const clearDeferredActions = (): ClearDeferredActions => ({
  type: CLEAR_DEFERRED_ACTIONS
});

export type DeferredActions =
  | DeferToLogin
  | PushToDeferredActions
  | ClearDeferredActions;
