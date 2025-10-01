import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIOStore } from "../../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { getFiscalCodeFromCredential } from "../../common/utils/itwClaimsUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import { isItwCredential } from "../../common/utils/itwCredentialUtils";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import {
  itwIsL3EnabledSelector,
  itwIsSimplifiedActivationRequired
} from "../../common/store/selectors/preferences";
import { Context } from "./context";
import { EidIssuanceEvents } from "./events";

type GuardsImplementationOptions = Partial<{
  bypassIdentityMatch: boolean;
}>;

export const createEidIssuanceGuardsImplementation = (
  store: ReturnType<typeof useIOStore>,
  options?: GuardsImplementationOptions
) => ({
  /**
   * Guard to check whether the user for whom the eID was issued
   * is the same that is currently authenticated in app.
   */
  issuedEidMatchesAuthenticatedUser: ({ context }: { context: Context }) => {
    if (options?.bypassIdentityMatch) {
      return true;
    }

    const authenticatedUserFiscalCode = profileFiscalCodeSelector(
      store.getState()
    );

    const eidFiscalCode = getFiscalCodeFromCredential(context.eid);

    return authenticatedUserFiscalCode === eidFiscalCode;
  },

  isSessionExpired: ({ event }: { event: EidIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.walletInstanceAttestation?.jwt),
      O.map(isWalletInstanceAttestationValid),
      O.getOrElse(() => false)
    ),

  /**
   * Check whether the user already has a valid L3 PID obtained from a previous issuance
   * while not being whitelisted, to activate IT-Wallet without re-authenticating.
   */
  isEligibleForItwSimplifiedActivation: () => {
    const state = store.getState();
    const pid = O.toUndefined(itwCredentialsEidSelector(state));
    return (
      !!pid &&
      itwIsSimplifiedActivationRequired(state) && // The flag for simplified activation is enabled
      itwIsL3EnabledSelector(state) && // The user has been whitelisted to officially activate IT-Wallet
      isItwCredential(pid) && // Extra check to ensure the PID is a valid L3 credential
      getCredentialStatus(pid) === "valid"
    );
  }
});
