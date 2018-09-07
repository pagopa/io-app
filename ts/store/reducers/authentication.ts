import { none, Option, some } from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";
import {
  IDP_SELECTED,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  SESSION_EXPIRED,
  SESSION_INFO_LOAD_SUCCESS,
  SESSION_INVALID
} from "../actions/constants";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

// Types

type AuthenticationKinds =
  | "LoggedOutWithoutIdp"
  | "LoggedOutWithIdp"
  | "LoggedInWithoutSessionInfo"
  | "LoggedInWithSessionInfo";

type LoggedOutReason = "NOT_LOGGED_IN" | "SESSION_EXPIRED";

interface AuthenticationStateBaseInterface {
  kind: AuthenticationKinds;
  sessionToken?: SessionToken;
  sessionInfo?: PublicSession;
  reason?: LoggedOutReason;
}

// The user is logged out and hasn't selected an IDP
export interface LoggedOutWithoutIdp extends AuthenticationStateBaseInterface {
  kind: "LoggedOutWithoutIdp";
  reason: LoggedOutReason;
}

// The user is logged out but has already selected an IDP
export interface LoggedOutWithIdp extends AuthenticationStateBaseInterface {
  kind: "LoggedOutWithIdp";
  idp: IdentityProvider;
  reason: LoggedOutReason;
}

// The user is logged in but we still have to request the addition session info to the Backend
export interface LoggedInWithoutSessionInfo
  extends AuthenticationStateBaseInterface {
  kind: "LoggedInWithoutSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
}

// The user is logged in and we also have all session info
export interface LoggedInWithSessionInfo
  extends AuthenticationStateBaseInterface {
  kind: "LoggedInWithSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  sessionInfo: PublicSession;
}

export type AuthenticationState =
  | LoggedOutWithoutIdp
  | LoggedOutWithIdp
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

// Here we mix the plain AuthenticationState with the keys added by redux-persist
export type PersistedAuthenticationState = AuthenticationState & PersistPartial;

// Initially the user is logged out and hasn't selected an IDP
export const INITIAL_STATE: LoggedOutWithoutIdp = {
  kind: "LoggedOutWithoutIdp",
  reason: "NOT_LOGGED_IN"
};

// Type guards

export function isLoggedOutWithoutIdp(
  state: AuthenticationState
): state is LoggedOutWithoutIdp {
  return state.kind === "LoggedOutWithoutIdp";
}

export function isLoggedOutWithIdp(
  state: AuthenticationState
): state is LoggedOutWithIdp {
  return state.kind === "LoggedOutWithIdp";
}

export function isLoggedInWithoutSessionInfo(
  state: AuthenticationState
): state is LoggedInWithoutSessionInfo {
  return state.kind === "LoggedInWithoutSessionInfo";
}

export function isLoggedInWithSessionInfo(
  state: AuthenticationState
): state is LoggedInWithSessionInfo {
  return state.kind === "LoggedInWithSessionInfo";
}

export function isLoggedIn(
  state: AuthenticationState
): state is LoggedInWithoutSessionInfo | LoggedInWithSessionInfo {
  return (
    isLoggedInWithoutSessionInfo(state) || isLoggedInWithSessionInfo(state)
  );
}

// Selectors

export const isLoggedInSelector = (state: GlobalState): boolean =>
  isLoggedIn(state.authentication);

export const sessionTokenSelector = (
  state: GlobalState
): SessionToken | undefined => {
  return isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined;
};

export const sessionInfoSelector = (
  state: GlobalState
): Option<PublicSession> => {
  return isLoggedInWithSessionInfo(state.authentication)
    ? some(state.authentication.sessionInfo)
    : none;
};

export const walletTokenSelector = (state: GlobalState): Option<string> =>
  sessionInfoSelector(state).map(s => s.walletToken);

const reducer = (
  state: AuthenticationState = INITIAL_STATE,
  action: Action
): AuthenticationState => {
  if (action.type === IDP_SELECTED && !isLoggedIn(state)) {
    // Save the selected IDP in the state
    return {
      ...state,
      ...{
        kind: "LoggedOutWithIdp",
        idp: action.payload
      }
    };
  }

  if (action.type === LOGIN_SUCCESS && isLoggedOutWithIdp(state)) {
    // Save the SessionToken (got from the WebView redirect url) in the state
    return {
      ...state,
      ...{
        kind: "LoggedInWithoutSessionInfo",
        sessionToken: action.payload
      }
    };
  }

  if (action.type === SESSION_INFO_LOAD_SUCCESS && isLoggedIn(state)) {
    // Save the session info in the state
    return {
      ...state,
      ...{
        kind: "LoggedInWithSessionInfo",
        sessionInfo: action.payload
      }
    };
  }

  if (
    (action.type === SESSION_EXPIRED ||
      action.type === SESSION_INVALID ||
      action.type === LOGOUT_SUCCESS) &&
    isLoggedIn(state)
  ) {
    return {
      kind: "LoggedOutWithIdp",
      idp: state.idp,
      reason:
        action.type === SESSION_EXPIRED ? "SESSION_EXPIRED" : "NOT_LOGGED_IN"
    };
  }

  return state;
};

export default reducer;
