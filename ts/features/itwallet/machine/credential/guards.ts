import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";
import { CredentialIssuanceFailureType } from "./failure";

export const createCredentialIssuanceGuardsImplementation = () => ({
  isSessionExpired: ({ event }: { event: CredentialIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  isDeferredIssuance: ({ context }: { context: Context }) =>
    context.failure?.type === CredentialIssuanceFailureType.ASYNC_ISSUANCE,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.walletInstanceAttestation),
      O.map(isWalletInstanceAttestationValid),
      O.getOrElse(() => false)
    )
});
