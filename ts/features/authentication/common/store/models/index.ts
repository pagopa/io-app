import { PublicSession } from "../../../../../../definitions/session_manager/PublicSession";
import { SpidIdp } from "../../../../../utils/idps";

// reason for the user to be in the unauthenticated state
type LoggedOutReason =
  | "NOT_LOGGED_IN"
  | "SESSION_EXPIRED"
  | "SESSION_CORRUPTED";

// PublicSession attributes
export type TokenName = keyof Omit<
  PublicSession,
  "spidLevel" | "lollipopAssertionRef"
>;

// The user is logged out and hasn't selected an IDP
export type LoggedOutWithoutIdp = Readonly<{
  kind: "LoggedOutWithoutIdp";
  reason: LoggedOutReason;
}>;

// The user is logged out but has already selected an IDP
export type LoggedOutWithIdp = Readonly<{
  kind: "LoggedOutWithIdp";
  idp: SpidIdp;
  reason: LoggedOutReason;
}>;

// The user is logged in but we still have to request the addition session info to the Backend
export type LoggedInWithoutSessionInfo = Readonly<{
  kind: "LoggedInWithoutSessionInfo";
  idp: SpidIdp;
  sessionToken: string;
}>;

// The user is logged in and we also have all session info
export type LoggedInWithSessionInfo = Readonly<{
  kind: "LoggedInWithSessionInfo";
  idp: SpidIdp;
  sessionToken: string;
  sessionInfo: PublicSession;
}>;

export type LogoutRequested = Readonly<{
  kind: "LogoutRequested";
  idp: SpidIdp;
  sessionToken: string;
  reason: LoggedOutReason;
}>;

export type AuthenticationState =
  | LoggedOutWithoutIdp
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

export type AuthenticationStateWithIdp =
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;
