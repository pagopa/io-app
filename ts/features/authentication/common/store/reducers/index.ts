/* eslint-disable complexity */
import { PersistPartial } from "redux-persist";
import { isActionOf } from "typesafe-actions";
import {
  clearCurrentSession,
  idpSelected,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  resetAuthenticationState,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid,
  logoutRequest,
  loginFailure,
  sessionCorrupted
} from "../actions";
import { Action } from "../../../../../store/actions/types";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { AuthenticationState, LoggedOutWithoutIdp } from "../models";
import {
  isLoggedIn,
  isLoggedOutWithIdp,
  isSessionExpired
} from "../utils/guards";
import {
  consolidateActiveSessionLoginData,
  setFinalizeLoggedOutUserWithDifferentCF
} from "../../../activeSessionLogin/store/actions";

// Here we mix the plain AuthenticationState with the keys added by redux-persist
type PersistedAuthenticationState = AuthenticationState & PersistPartial;

// Initially the user is logged out and hasn't selected an IDP
export const INITIAL_STATE: LoggedOutWithoutIdp = {
  kind: "LoggedOutWithoutIdp",
  reason: "NOT_LOGGED_IN"
};

const authenticationReducer = (
  state: AuthenticationState = INITIAL_STATE,
  action: Action
  // eslint-disable-next-line sonarjs/cognitive-complexity
): AuthenticationState => {
  if (isActionOf(idpSelected, action) && !isLoggedIn(state)) {
    // Save the selected IDP in the state
    return {
      ...state,
      ...{
        kind: "LoggedOutWithIdp",
        idp: action.payload
      }
    };
  }

  if (isActionOf(loginSuccess, action) && isLoggedOutWithIdp(state)) {
    // Save the SessionToken (got from the WebView redirect url) in the state
    return {
      kind: "LoggedInWithoutSessionInfo",
      idp: state.idp,
      sessionToken: action.payload.token
    };
  }

  if (
    isActionOf(consolidateActiveSessionLoginData, action) &&
    isLoggedIn(state)
  ) {
    // Save the SessionToken (got from the WebView redirect url) in the state
    return {
      ...state,
      idp: action.payload.idp,
      sessionToken: action.payload.token
    };
  }

  if (isActionOf(refreshSessionToken.success, action) && isLoggedIn(state)) {
    // Save the new SessionToken in the state
    return {
      ...state,
      ...{
        sessionToken: action.payload
      }
    };
  }

  if (isActionOf(sessionInformationLoadSuccess, action) && isLoggedIn(state)) {
    // Save the session info in the state
    return {
      ...state,
      ...{
        kind: "LoggedInWithSessionInfo",
        sessionInfo: action.payload
      }
    };
  }

  if (isActionOf(logoutRequest, action) && isLoggedIn(state)) {
    return {
      ...state,
      ...{
        kind: "LogoutRequested",
        reason: "NOT_LOGGED_IN"
      }
    };
  }

  if (
    (isActionOf(sessionExpired, action) ||
      isActionOf(sessionCorrupted, action) ||
      isActionOf(loginFailure, action) ||
      isActionOf(sessionInvalid, action) ||
      isActionOf(logoutSuccess, action) ||
      isActionOf(setFinalizeLoggedOutUserWithDifferentCF, action) ||
      isActionOf(logoutFailure, action)) &&
    isLoggedIn(state)
  ) {
    return {
      kind: "LoggedOutWithIdp",
      idp: state.idp,
      reason: isActionOf(sessionExpired, action)
        ? "SESSION_EXPIRED"
        : isActionOf(sessionCorrupted, action)
        ? "SESSION_CORRUPTED"
        : "NOT_LOGGED_IN"
    };
  }

  if (isActionOf(clearCurrentSession, action)) {
    return INITIAL_STATE;
  }

  if (isActionOf(resetAuthenticationState, action) && isSessionExpired(state)) {
    return INITIAL_STATE;
  }

  return state;
};

export type { AuthenticationState, PersistedAuthenticationState };
export default authenticationReducer;
