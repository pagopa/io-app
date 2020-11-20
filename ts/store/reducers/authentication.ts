import { none, Option, some } from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { createSelector } from "reselect";
import { isActionOf } from "typesafe-actions";
import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";
import {
  idpSelected,
  loadSupportToken,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  resetAuthenticationState,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../actions/authentication";
import { Action } from "../actions/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../features/bonus/bpd/model/RemoteValue";
import { SupportToken } from "../../../definitions/backend/SupportToken";
import { logoutRequest } from "./../actions/authentication";
import { GlobalState } from "./types";

// Types

// reason for the user to be in the unauthenticated state
type LoggedOutReason = "NOT_LOGGED_IN" | "SESSION_EXPIRED";

// PublicSession attributes
export type TokenName = keyof Omit<PublicSession, "spidLevel">;

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

export type SupportTokenState = RemoteValue<SupportToken, Error>;
// The user is logged in and we also have all session info
export type LoggedInWithSessionInfo = Readonly<{
  kind: "LoggedInWithSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  sessionInfo: PublicSession;
  supportToken?: SupportTokenState;
}>;

export type LogoutRequested = Readonly<{
  kind: "LogoutRequested";
  idp: IdentityProvider;
  reason: LoggedOutReason;
}>;

export type AuthenticationState =
  | LoggedOutWithoutIdp
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

type AuthenticationStateWithIdp =
  | LoggedOutWithIdp
  | LogoutRequested
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

export function isSessionExpired(
  state: AuthenticationState
): state is LoggedOutWithoutIdp | LoggedOutWithIdp {
  return isLoggedOutWithIdp(state) && state.reason === "SESSION_EXPIRED";
}

// Selectors

export const isLogoutRequested = (state: GlobalState) =>
  state.authentication.kind === "LogoutRequested";

export const isSessionExpiredSelector = (state: GlobalState) =>
  !isLoggedIn(state.authentication) && isSessionExpired(state.authentication);

export const sessionTokenSelector = (
  state: GlobalState
): SessionToken | undefined =>
  isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined;

export const sessionInfoSelector = (state: GlobalState) =>
  isLoggedInWithSessionInfo(state.authentication)
    ? some(state.authentication.sessionInfo)
    : none;

export const supportTokenSelector = (state: GlobalState): SupportTokenState =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.supportToken ?? remoteUndefined
    : remoteUndefined;

export const tokenFromNameSelector = (
  tokenName: TokenName
): ((state: GlobalState) => Option<string>) =>
  createSelector<GlobalState, Option<PublicSession>, Option<string>>(
    sessionInfoSelector,
    maybeSessionInfo => maybeSessionInfo.map(si => si[tokenName])
  );

export const selectedIdentityProviderSelector = (state: GlobalState) =>
  isLoggedOutWithIdp(state.authentication)
    ? state.authentication.idp
    : undefined;

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

// eslint-disable-next-line complexity
const reducer = (
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

  if (
    isActionOf(loadSupportToken.request, action) &&
    isLoggedInWithSessionInfo(state)
  ) {
    return {
      ...state,
      supportToken: remoteLoading
    };
  }

  if (
    isActionOf(loadSupportToken.success, action) &&
    isLoggedInWithSessionInfo(state)
  ) {
    return {
      ...state,
      supportToken: remoteReady(action.payload)
    };
  }

  if (
    isActionOf(loadSupportToken.failure, action) &&
    isLoggedInWithSessionInfo(state)
  ) {
    return {
      ...state,
      supportToken: remoteError(action.payload)
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
      isActionOf(sessionInvalid, action) ||
      isActionOf(logoutSuccess, action) ||
      isActionOf(logoutFailure, action)) &&
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

  if (isActionOf(resetAuthenticationState, action) && isSessionExpired(state)) {
    return INITIAL_STATE;
  }

  return state;
};

export default reducer;
