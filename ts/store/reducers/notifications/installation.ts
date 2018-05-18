/**
 * Notifications installation reducer
 */

import uuid from "uuid/v4";

import { Action } from "../../../actions/types";
import { GlobalState } from "../../../reducers/types";
import { NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE } from "../../actions/constants";

export type InstallationState = Readonly<{
  uuid: string;
  token: string | undefined;
}>;

export function getInitialState(): InstallationState {
  return {
    uuid: uuid(),
    token: undefined
  };
}

const reducer = (
  state: InstallationState = getInitialState(),
  action: Action
): InstallationState => {
  switch (action.type) {
    case NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE:
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
