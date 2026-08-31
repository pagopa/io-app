import { useIOStore } from "../../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { getFiscalCodeFromCredential } from "../../common/utils/itwClaimsUtils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
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

    const eidFiscalCode = getFiscalCodeFromCredential(context.eid?.metadata);

    return authenticatedUserFiscalCode === eidFiscalCode;
  },

  isSessionExpired: ({ event }: { event: EidIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) => {
    const attestation = context.walletInstanceAttestation?.jwt;
    return (
      attestation !== undefined &&
      isWalletInstanceAttestationValid(context.itwVersion, attestation)
    );
  },

  isWalletValid: () => itwLifecycleIsValidSelector(store.getState())
});
