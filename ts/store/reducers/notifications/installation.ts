/**
 * Notifications installation reducer
 */

import uuid from "uuid";

import { Action } from "../../../actions/types";
import { GlobalState } from "../../../reducers/types";
import { NOTIFICATIONS_TOKEN_UPDATE } from "../../actions/constants";

export type InstallationState = {
  uuid: string;
  token: string | null;
};

export const INITIAL_STATE: InstallationState = {
  uuid: uuid(),
  token: null
};

const reducer = (
  state: InstallationState = INITIAL_STATE,
  action: Action
): InstallationState => {
  switch (action.type) {
    case NOTIFICATIONS_TOKEN_UPDATE:
      return { ...state, token: action.payload };
    default:
      return state;
  }
};

// Selectors
export const notificationsInstallationSelector = (state: GlobalState) => {
  return state.notifications.installation;
};

export default reducer;
