import { PublicSession } from "../../../../../../definitions/session_manager/PublicSession";
import { SpidIdp } from "../../../../../utils/idps";

export type AuthenticationState =
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo
  | LoggedOutWithIdp
  | LoggedOutWithoutIdp
  | LogoutRequested;

export type AuthenticationStateWithIdp =
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo
  | LoggedOutWithIdp
  | LogoutRequested;

// The user is logged in but we still have to request the addition session info to the Backend
export type LoggedInWithoutSessionInfo = Readonly<{
  idp: SpidIdp;
  kind: "LoggedInWithoutSessionInfo";
  sessionToken: string;
}>;

// The user is logged in and we also have all session info
export type LoggedInWithSessionInfo = Readonly<{
  idp: SpidIdp;
  kind: "LoggedInWithSessionInfo";
  sessionInfo: PublicSession;
  sessionToken: string;
}>;

// The user is logged out but has already selected an IDP
export type LoggedOutWithIdp = Readonly<{
  idp: SpidIdp;
  kind: "LoggedOutWithIdp";
  reason: LoggedOutReason;
}>;

// The user is logged out and hasn't selected an IDP
export type LoggedOutWithoutIdp = Readonly<{
  kind: "LoggedOutWithoutIdp";
  reason: LoggedOutReason;
}>;

export type LogoutRequested = Readonly<{
  idp: SpidIdp;
  kind: "LogoutRequested";
  reason: LoggedOutReason;
  sessionToken: string;
}>;

// PublicSession attributes
export type TokenName = keyof Omit<
  PublicSession,
  "lollipopAssertionRef" | "spidLevel"
>;

// reason for the user to be in the unauthenticated state
type LoggedOutReason =
  | "NOT_LOGGED_IN"
  | "SESSION_CORRUPTED"
  | "SESSION_EXPIRED";
