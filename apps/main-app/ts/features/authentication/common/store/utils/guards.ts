import {
  AuthenticationState,
  LoggedInWithoutSessionInfo,
  LoggedInWithSessionInfo,
  LoggedOutWithIdp,
  LoggedOutWithoutIdp,
  LogoutRequested
} from "../models";

export function isLoggedIn(
  state: AuthenticationState
): state is LoggedInWithoutSessionInfo | LoggedInWithSessionInfo {
  return (
    isLoggedInWithoutSessionInfo(state) || isLoggedInWithSessionInfo(state)
  );
}

export function isLoggedInWithSessionInfo(
  state: AuthenticationState
): state is LoggedInWithSessionInfo {
  return state.kind === "LoggedInWithSessionInfo";
}

export function isLoggedOutWithIdp(
  state: AuthenticationState
): state is LoggedOutWithIdp {
  return state.kind === "LoggedOutWithIdp";
}

export function isLogoutRequested(
  state: AuthenticationState
): state is LogoutRequested {
  return state.kind === "LogoutRequested";
}

export function isSessionCorrupted(
  state: AuthenticationState
): state is LoggedOutWithIdp | LoggedOutWithoutIdp {
  return isLoggedOutWithIdp(state) && state.reason === "SESSION_CORRUPTED";
}

export function isSessionExpired(
  state: AuthenticationState
): state is LoggedOutWithIdp | LoggedOutWithoutIdp {
  return isLoggedOutWithIdp(state) && state.reason === "SESSION_EXPIRED";
}

function isLoggedInWithoutSessionInfo(
  state: AuthenticationState
): state is LoggedInWithoutSessionInfo {
  return state.kind === "LoggedInWithoutSessionInfo";
}
