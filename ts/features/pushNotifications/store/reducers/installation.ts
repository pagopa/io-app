import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../../authentication/common/store/actions";
import { clearCache } from "../../../../store/actions/profile";
import {
  generateInstallationId,
  generateTokenRegistrationTime
} from "../../utils";
import {
  newPushNotificationsToken,
  pushNotificationsTokenUploaded
} from "../actions/installation";

export const TokenRegistrationResendDelay = 1000 * 60 * 60 * 24;

type TokenStatusUnsent = {
  status: "unsent";
};
type TokenStatusSentUnconfirmed = {
  status: "sentUnconfirmed";
  date: number;
};
type TokenStatusSentConfirmed = {
  status: "sentConfirmed";
};
export type TokenStatus =
  | TokenStatusUnsent
  | TokenStatusSentUnconfirmed
  | TokenStatusSentConfirmed;

export type InstallationState = Readonly<{
  id: string;
  // the current push notification token release from push notification service (APNS, Firebase)
  token?: string;
  // the token registered in the backend
  registeredToken?: string;
  // This is a temporary measure to overcome a backend anomaly where the token may have been deleted
  // after registration. After the token registration, the app waits for a day and then registers
  // the token again.
  tokenStatus: TokenStatus;
}>;

export const generateInitialState = (): InstallationState => ({
  id: generateInstallationId(),
  token: undefined,
  registeredToken: undefined,
  tokenStatus: { status: "unsent" }
});

export const installationReducer = (
  state: InstallationState = generateInitialState(),
  action: Action
): InstallationState => {
  switch (action.type) {
    case getType(newPushNotificationsToken):
      return {
        ...state,
        token: action.payload,
        tokenStatus: { status: "unsent" }
      };
    case getType(pushNotificationsTokenUploaded):
      const newTokenStatus: TokenStatus =
        state.tokenStatus.status === "unsent"
          ? { status: "sentUnconfirmed", date: generateTokenRegistrationTime() }
          : { status: "sentConfirmed" };
      return {
        ...state,
        registeredToken: action.payload,
        tokenStatus: newTokenStatus
      };
    // clear registeredToken when the authentication is not longer valid
    // IO backend will automatically delete it on the next user login
    case getType(sessionExpired):
    case getType(sessionInvalid):
    case getType(logoutRequest): // even if the logout fails
    case getType(clearCache):
      return {
        ...state,
        registeredToken: undefined,
        tokenStatus: { status: "unsent" }
      };
    default:
      return state;
  }
};

// Selectors
export const notificationsInstallationSelector = (state: GlobalState) =>
  state.notifications.installation;

export const canSkipTokenRegistrationSelector = (state: GlobalState) => {
  const tokenStatus = state.notifications.installation.tokenStatus;
  return (
    tokenStatus.status === "sentConfirmed" ||
    (tokenStatus.status === "sentUnconfirmed" &&
      generateTokenRegistrationTime() - tokenStatus.date <
        TokenRegistrationResendDelay)
  );
};
