/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import { Action } from "../../../../store/actions/types";
import { InstallationState, installationReducer } from "./installation";
import { PendingMessageState, pendingMessageReducer } from "./pendingMessage";

export type PersistedNotificationsState = NotificationsState & PersistPartial;

type A = {
  enabled: boolean;
};

type B = {
  data: string;
};

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
  nonPersistedProp: A;
  persistedProp: B;
};

export const notificationsReducer = combineReducers<NotificationsState, Action>(
  {
    installation: installationReducer,
    pendingMessage: pendingMessageReducer,
    nonPersistedProp: (state = { enabled: false }, _action) => {
      if (_action.type === "IDENTIFICATION_SUCCESS") {
        return {
          ...state,
          enabled: true
        };
      }
      return state;
    },
    persistedProp: (state = { data: "a" }, _action) => {
      if (_action.type === "IDENTIFICATION_SUCCESS") {
        return {
          ...state,
          data: "identification"
        };
      }
      return state;
    }
  }
);
