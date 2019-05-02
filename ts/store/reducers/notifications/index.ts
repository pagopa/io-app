/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import installationReducer, { InstallationState } from "./installation";
import localScheduledReducer, { LocalScheduledState } from "./localScheduled";
import pendingMessageReducer, { PendingMessageState } from "./pendingMessage";

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
  scheduled: LocalScheduledState;
};

const reducer = combineReducers<NotificationsState, Action>({
  installation: installationReducer,
  pendingMessage: pendingMessageReducer,
  scheduled: localScheduledReducer
});

export default reducer;
