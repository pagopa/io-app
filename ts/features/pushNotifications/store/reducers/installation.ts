import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  logoutRequest,
  sessionCorrupted,
  sessionExpired,
  sessionInvalid
} from "../../../authentication/common/store/actions";
import { clearCache } from "../../../settings/common/store/actions";
import {
  generateInstallationId,
  generateTokenRegistrationTime
} from "../../utils";
import {
  newPushNotificationsToken,
  pushNotificationsTokenUploaded
} from "../actions/installation";
import { consolidateActiveSessionLoginData } from "../../../authentication/activeSessionLogin/store/actions";

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
  // This ID is a legacy feature that is not used anymore but is required as a mandatory parameter
  // when submitting the push notification token to the backend (latter does nothing with it,
  // apart from checking its presence in the url)
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
      const actionNewToken = action.payload;
      // If registeredToken is defined and matches the action's token,
      // then 'tokenStatus' must be preserved. 'token' and 'registeredToken'
      // are set to the same value, to make sure that the state is consistent
      if (
        state.registeredToken != null &&
        state.registeredToken === actionNewToken
      ) {
        return {
          ...state,
          token: actionNewToken,
          registeredToken: actionNewToken
        };
      }
      // In this case:
      // - registeredToken is undefined, then 'tokenStatus' must be unsent
      // - registeredToken is defined but different from the action's
      //   token, then 'tokenStatus' must be unsent since it is new,
      //   regardless of the previous tokenStatus
      return {
        ...state,
        token: actionNewToken,
        registeredToken: undefined,
        tokenStatus: { status: "unsent" }
      };
    case getType(pushNotificationsTokenUploaded):
      const actionRegisteredToken = action.payload;
      // This should never happen, since the action's token comes from
      // 'state.token'. Nonetheless, if 'state.token' and action's token
      // are different, make sure to treat the 'state.token' as unsent
      // and clear the 'registeredToken'
      if (state.token !== actionRegisteredToken) {
        return {
          ...state,
          registeredToken: undefined,
          tokenStatus: { status: "unsent" }
        };
      }
      const newTokenStatus: TokenStatus =
        state.tokenStatus.status === "unsent"
          ? { status: "sentUnconfirmed", date: generateTokenRegistrationTime() }
          : { status: "sentConfirmed" };
      return {
        ...state,
        registeredToken: actionRegisteredToken,
        tokenStatus: newTokenStatus
      };
    // Clear registeredToken when the authentication is not longer valid
    // IO backend will automatically delete it on the next user login
    case getType(sessionExpired):
    case getType(sessionCorrupted):
    case getType(sessionInvalid):
    case getType(logoutRequest): // even if the logout fails
    case getType(clearCache):
    case getType(consolidateActiveSessionLoginData):
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
