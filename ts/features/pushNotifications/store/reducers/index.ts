/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { InstallationState, installationReducer } from "./installation";
import { PendingMessageState, pendingMessageReducer } from "./pendingMessage";

export type PersistedNotificationsState = NotificationsState & PersistPartial;

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
