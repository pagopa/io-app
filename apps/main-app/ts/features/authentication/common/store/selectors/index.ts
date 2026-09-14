import {
  SpidLevel,
  SpidLevelEnum
} from "@io-app/api-types/generated/definitions/session_manager/SpidLevel";
import { Optional } from "@io-app/design-system";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import { format } from "../../../../../utils/dates";
import { SpidIdp } from "../../../../../utils/idps";
import { AuthenticationState, AuthenticationStateWithIdp } from "../models";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo,
  isLoggedOutWithIdp,
  isLogoutRequested,
  isSessionCorrupted,
  isSessionExpired
} from "../utils/guards";

type AuthLevel = "L1" | "L2" | "L3";

const AUTH_LEVEL_MAP: Record<SpidLevelEnum, AuthLevel> = {
  [SpidLevelEnum["https://www.spid.gov.it/SpidL1"]]: "L1",
  [SpidLevelEnum["https://www.spid.gov.it/SpidL2"]]: "L2",
  [SpidLevelEnum["https://www.spid.gov.it/SpidL3"]]: "L3"
};

export const authenticationStateSelector = (
  state: GlobalState
): AuthenticationState => state.authentication;

export const loggedOutWithIdpAuthSelector = createSelector(
  authenticationStateSelector,
  authState => (isLoggedOutWithIdp(authState) ? authState : undefined)
);

export const isSessionExpiredSelector = (state: GlobalState) =>
  !isLoggedIn(state.authentication) && isSessionExpired(state.authentication);

export const isSessionCorruptedSelector = (state: GlobalState) =>
  !isLoggedIn(state.authentication) && isSessionCorrupted(state.authentication);

export const sessionTokenSelector = (state: GlobalState): string | undefined =>
  isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined;

export const bareSessionTokenSelector = (
  state: GlobalState
): Optional<string> =>
  isLogoutRequested(state.authentication)
    ? state.authentication.sessionToken
    : undefined;

export const fimsTokenSelector = (state: GlobalState): string | undefined =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.fimsToken
    : undefined;

/**
 * Return the authentication header required for IO Backend requests
 */
export const ioBackendAuthenticationHeaderSelector = createSelector(
  sessionTokenSelector,
  (token): { [key: string]: string } => ({ Authorization: `Bearer ${token}` })
);

export const sessionInfoSelector = createSelector(
  (state: GlobalState) => state.authentication,
  authentication =>
    isLoggedInWithSessionInfo(authentication)
      ? authentication.sessionInfo
      : undefined
);

export const formattedExpirationDateSelector = createSelector(
  sessionInfoSelector,
  sessionInfo =>
    sessionInfo?.expirationDate
      ? format(sessionInfo.expirationDate, "D MMMM")
      : "N/A"
);

export const zendeskTokenSelector = (state: GlobalState): string | undefined =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.zendeskToken
    : undefined;

export const spidLevelSelector = (state: GlobalState): SpidLevel | undefined =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.spidLevel
    : undefined;

/**
 * Extracts the short SPID level (L1, L2, L3) from the full SPID level string
 * retrieved from the current session (e.g., "https://www.spid.gov.it/SpidL2").
 *
 * @param spidLevel - The full SPID level string from the session.
 * @returns The shortened SPID level or `undefined` if the input is invalid or missing.
 */
export const extractSpidLevel = (
  spidLevel?: SpidLevelEnum
): AuthLevel | undefined => (spidLevel ? AUTH_LEVEL_MAP[spidLevel] : undefined);

/**
 * Extracts the short SPID level (L1, L2, L3) from the full SPID level string
 * retrieved from the current session.
 *
 * @param spidLevel - The full SPID level string from the session.
 * @returns The shortened SPID level or `undefined` if the input is invalid or missing.
 */
export const spidLevelFromSessionInfoSelector = (
  state: GlobalState
): AuthLevel | undefined => {
  const spidLevel = spidLevelSelector(state);
  return extractSpidLevel(spidLevel);
};

export const walletTokenSelector = (state: GlobalState): string | undefined =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.walletToken
    : undefined;

export const bpdTokenSelector = (state: GlobalState): string | undefined =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.bpdToken
    : undefined;

export const loggedInIdpSelector = (state: GlobalState) =>
  isLoggedIn(state.authentication) ? state.authentication.idp : undefined;

export const isLoggedInWithTestIdpSelector = (state: GlobalState) =>
  isLoggedIn(state.authentication) && state.authentication.idp.isTestIdp;

export const selectedIdentityProviderSelector = createSelector(
  authenticationStateSelector,
  authState => (isLoggedOutWithIdp(authState) ? authState.idp : undefined)
);

function matchWithIdp<I>(
  state: AuthenticationState,
  whenWithoutIdp: I,
  whenWithIdp: (state: AuthenticationStateWithIdp) => I
): I {
  if (state.kind === "LoggedOutWithoutIdp") {
    return whenWithoutIdp;
  }

  return whenWithIdp(state);
}

export const idpSelector = ({
  authentication
}: GlobalState): O.Option<SpidIdp> =>
  matchWithIdp(authentication, O.none, ({ idp }) => O.some(idp));

export const loggedInAuthSelector = ({ authentication }: GlobalState) =>
  isLoggedIn(authentication) ? authentication : undefined;
