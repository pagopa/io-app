/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import installationReducer, { InstallationState } from "./installation";
import pendingMessageReducer, { PendingMessageState } from "./pendingMessage";

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
};

const reducer = combineReducers<NotificationsState, Action>({
  installation: installationReducer,
  pendingMessage: pendingMessageReducer
});

export default reducer;
