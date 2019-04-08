/**
 * Notifications installation reducer
 */

import { getType } from "typesafe-actions";

import { generateInstallationId } from "../../../utils/installation";
import { updateNotificationsInstallationToken } from "../../actions/notifications";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type InstallationState = Readonly<{
  id: string;
  token?: string;
}>;

export function getInitialState(): InstallationState {
  return {
    id: generateInstallationId(),
    token: undefined
  };
}

const reducer = (
  state: InstallationState = getInitialState(),
  action: Action
): InstallationState => {
  switch (action.type) {
    case getType(updateNotificationsInstallationToken):
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
