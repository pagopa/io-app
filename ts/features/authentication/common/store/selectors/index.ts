import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Optional } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo,
  isLoggedOutWithIdp,
  isLogoutRequested,
  isSessionCorrupted,
  isSessionExpired
} from "../utils/guards";
import { SpidIdp } from "../../../../../utils/idps";
import { SessionToken } from "../../../../../types/SessionToken";
import { format } from "../../../../../utils/dates";
import { AuthenticationState, AuthenticationStateWithIdp } from "../models";

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

export const sessionTokenSelector = (
  state: GlobalState
): SessionToken | undefined =>
  isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined;

export const bareSessionTokenSelector = (
  state: GlobalState
): Optional<SessionToken> =>
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
      ? O.some(authentication.sessionInfo)
      : O.none
);

export const formattedExpirationDateSelector = createSelector(
  sessionInfoSelector,
  sessionInfo =>
    pipe(
      sessionInfo,
      O.chainNullableK(({ expirationDate }) => expirationDate),
      O.map(expirationDate => format(expirationDate, "D MMMM")),
      O.getOrElse(() => "N/A")
    )
);

export const zendeskTokenSelector = (state: GlobalState): string | undefined =>
  isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.zendeskToken
    : undefined;

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
