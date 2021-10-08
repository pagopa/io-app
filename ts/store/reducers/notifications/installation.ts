/**
 * Notifications installation reducer
 */

import { getType } from "typesafe-actions";

import { generateInstallationId } from "../../../utils/installation";
import {
  notificationsInstallationTokenRegistered,
  updateNotificationsInstallationToken
} from "../../actions/notifications";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";
import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../actions/authentication";
import { clearCache } from "../../actions/profile";

export type InstallationState = Readonly<{
  id: string;
  // the current push notification token release from push notification service (APNS, Firebase)
  token?: string;
  // the token registered in the backend
  registeredToken?: string;
}>;

export function getInitialState(): InstallationState {
  return {
    id: generateInstallationId(),
    token: undefined,
    registeredToken: undefined
  };
}

const reducer = (
  state: InstallationState = getInitialState(),
  action: Action
): InstallationState => {
  switch (action.type) {
    case getType(updateNotificationsInstallationToken):
      return { ...state, token: action.payload };
    case getType(notificationsInstallationTokenRegistered):
      return { ...state, registeredToken: action.payload };
    // clear registeredToken when the authentication is not longer valid
    // IO backend will automatically delete it on the next user login
    case getType(sessionExpired):
    case getType(sessionInvalid):
    case getType(logoutRequest): // even if the logout fails
    case getType(clearCache):
      return { ...state, registeredToken: undefined };
    default:
      return state;
  }
};

// Selectors
export const notificationsInstallationSelector = (state: GlobalState) =>
  state.notifications.installation;

export default reducer;
