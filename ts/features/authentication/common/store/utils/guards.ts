import {
  AuthenticationState,
  LoggedOutWithIdp,
  LoggedInWithoutSessionInfo,
  LoggedInWithSessionInfo,
  LoggedOutWithoutIdp,
  LogoutRequested
} from "../models";

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

export function isLogoutRequested(
  state: AuthenticationState
): state is LogoutRequested {
  return state.kind === "LogoutRequested";
}

export function isSessionExpired(
  state: AuthenticationState
): state is LoggedOutWithoutIdp | LoggedOutWithIdp {
  return isLoggedOutWithIdp(state) && state.reason === "SESSION_EXPIRED";
}

export function isSessionCorrupted(
  state: AuthenticationState
): state is LoggedOutWithoutIdp | LoggedOutWithIdp {
  return isLoggedOutWithIdp(state) && state.reason === "SESSION_CORRUPTED";
}
