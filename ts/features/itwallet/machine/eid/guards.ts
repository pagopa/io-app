import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIOStore } from "../../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { getFiscalCodeFromCredential } from "../../common/utils/itwClaimsUtils";
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
      O.map(wia =>
        isWalletInstanceAttestationValid(wia, context.isL3FeaturesEnabled)
      ),
      O.getOrElse(() => false)
    )
});
