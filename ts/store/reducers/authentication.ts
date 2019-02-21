import { none, Option, some } from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { isActionOf } from "typesafe-actions";

import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";
import {
  forgetCurrentSession,
  idpSelected,
  loginSuccess,
  logoutSuccess,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../actions/authentication";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

// Types

// reason for the user to be in the unauthenticated state
type LoggedOutReason = "NOT_LOGGED_IN" | "SESSION_EXPIRED";

// The user is logged out and hasn't selected an IDP
type LoggedOutWithoutIdp = Readonly<{
  kind: "LoggedOutWithoutIdp";
  reason: LoggedOutReason;
}>;

// The user is logged out but has already selected an IDP
export type LoggedOutWithIdp = Readonly<{
  kind: "LoggedOutWithIdp";
  idp: IdentityProvider;
  reason: LoggedOutReason;
}>;

// The user is logged in but we still have to request the addition session info to the Backend
export type LoggedInWithoutSessionInfo = Readonly<{
  kind: "LoggedInWithoutSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
}>;

// The user is logged in and we also have all session info
export type LoggedInWithSessionInfo = Readonly<{
  kind: "LoggedInWithSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  sessionInfo: PublicSession;
}>;

export type AuthenticationState =
  | LoggedOutWithoutIdp
  | LoggedOutWithIdp
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

type AuthenticationStateWithIdp =
  | LoggedOutWithIdp
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

// Here we mix the plain AuthenticationState with the keys added by redux-persist
export type PersistedAuthenticationState = AuthenticationState & PersistPartial;

// Initially the user is logged out and hasn't selected an IDP
const INITIAL_STATE: LoggedOutWithoutIdp = {
  kind: "LoggedOutWithoutIdp",
  reason: "NOT_LOGGED_IN"
};

// Type guards

export function isLoggedOutWithIdp(
  state: AuthenticationState
): state is LoggedOutWithIdp {
  return state.kind === "LoggedOutWithIdp";
}

function isLoggedInWithoutSessionInfo(
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

export const isSessionExpiredSelector = ({ authentication }: GlobalState) =>
  !isLoggedIn(authentication) && authentication.reason === "SESSION_EXPIRED";

// Selectors

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

function matchWithIdp<O>(
  state: AuthenticationState,
  whenWithoutIdp: O,
  whenWithIdp: (state: AuthenticationStateWithIdp) => O
): O {
  if (state.kind === "LoggedOutWithoutIdp") {
    return whenWithoutIdp;
  }

  return whenWithIdp(state);
}

export const idpSelector = ({
  authentication
}: GlobalState): Option<IdentityProvider> =>
  matchWithIdp(authentication, none, ({ idp }) => some(idp));

const reducer = (
  state: AuthenticationState = INITIAL_STATE,
  action: Action
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
      sessionToken: action.payload
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

  if (
    (isActionOf(sessionExpired, action) ||
      isActionOf(sessionInvalid, action) ||
      isActionOf(logoutSuccess, action)) &&
    isLoggedIn(state)
  ) {
    return {
      kind: "LoggedOutWithIdp",
      idp: state.idp,
      reason: isActionOf(sessionExpired, action)
        ? "SESSION_EXPIRED"
        : "NOT_LOGGED_IN"
    };
  }

  if (isActionOf(forgetCurrentSession, action)) {
    return {
      ...INITIAL_STATE
    };
  }

  return state;
};

export default reducer;
