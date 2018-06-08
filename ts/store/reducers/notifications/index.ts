/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import installationReducer, { InstallationState } from "./installation";

export type NotificationsState = {
  installation: InstallationState;
};

const reducer = combineReducers<NotificationsState, Action>({
  installation: installationReducer
});

export default reducer;
