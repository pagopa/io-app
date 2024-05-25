/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { InstallationState, installationReducer } from "./installation";
import { PendingMessageState, pendingMessageReducer } from "./pendingMessage";

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
};

export const notificationsReducer = combineReducers<NotificationsState, Action>(
  {
    installation: installationReducer,
    pendingMessage: pendingMessageReducer
  }
);
