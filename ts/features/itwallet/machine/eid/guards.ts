import { Credential } from "@pagopa/io-react-native-wallet";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as J from "fp-ts/lib/Json";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { useIOStore } from "../../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../../store/reducers/profile";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { getFiscalCodeFromCredential } from "../../common/utils/itwClaimsUtils";
import { ItwOperationAbortedError } from "../../common/utils/itwOpenUrlAndListenForRedirect";
import { Context } from "./context";
import { EidIssuanceEvents } from "./events";

const NativeAuthSessionClosed = t.type({
  error: t.literal("NativeAuthSessionClosed")
});

type GuardsImplementationOptions = Partial<{
  bypassIdentityMatch: boolean;
}>;

export const createEidIssuanceGuardsImplementation = (
  store: ReturnType<typeof useIOStore>,
  options?: GuardsImplementationOptions
) => ({
  /**
   * Guard to check whether a native authentication session
   * opened with io-react-native-login-utils was closed by the user.
   */
  isNativeAuthSessionClosed: ({ event }: { event: EidIssuanceEvents }) => {
    if (
      "error" in event &&
      event.error instanceof Credential.Issuance.Errors.AuthorizationError
    ) {
      return pipe(
        event.error.message,
        J.parse,
        E.map(NativeAuthSessionClosed.is),
        E.getOrElse(() => false)
      );
    }
    return false;
  },

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

  isOperationAborted: ({ event }: { event: EidIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwOperationAbortedError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.walletInstanceAttestation),
      O.map(isWalletInstanceAttestationValid),
      O.getOrElse(() => false)
    )
});
