import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../../../store/actions/authentication";
import { clearCache } from "../../../../store/actions/profile";
import {
  notificationsInstallationTokenRegistered,
  updateNotificationsInstallationToken
} from "../actions/notifications";
import { generateInstallationId } from "../../utils";

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

export const installationReducer = (
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
