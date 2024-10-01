/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { PersistConfig, PersistPartial, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../store/actions/types";
import { InstallationState, installationReducer } from "./installation";
import { PendingMessageState, pendingMessageReducer } from "./pendingMessage";
import {
  NotificationsPermissionsState,
  permissionsReducer
} from "./permissions";

export const NOTIFICATIONS_STORE_VERSION = -1;

export type PersistedNotificationsState = NotificationsState & PersistPartial;

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
  permissions: NotificationsPermissionsState;
};

export const notificationsPersistConfig: PersistConfig = {
  key: "notifications",
  storage: AsyncStorage,
  version: NOTIFICATIONS_STORE_VERSION,
  whitelist: ["installation", "pendingMessage"]
};

export const notificationsReducer = combineReducers<NotificationsState, Action>(
  {
    installation: installationReducer,
    pendingMessage: pendingMessageReducer,
    permissions: permissionsReducer
  }
);

export const persistedNotificationsReducer = persistReducer<
  NotificationsState,
  Action
>(notificationsPersistConfig, notificationsReducer);
