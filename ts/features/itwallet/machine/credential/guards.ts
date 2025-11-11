import { constFalse, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { useIOStore } from "../../../../store/hooks";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";
import { CredentialIssuanceFailureType } from "./failure";

export const createCredentialIssuanceGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  isSessionExpired: ({ event }: { event: CredentialIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  isDeferredIssuance: ({ context }: { context: Context }) =>
    context.failure?.type === CredentialIssuanceFailureType.ASYNC_ISSUANCE,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.walletInstanceAttestation?.jwt),
      O.map(isWalletInstanceAttestationValid),
      O.getOrElse(() => false)
    ),

  isStatusError: ({ context }: { context: Context }) =>
    context.failure?.type === CredentialIssuanceFailureType.INVALID_STATUS,

  isEidExpired: () => {
    const eidStatus = itwCredentialsEidStatusSelector(store.getState());

    return eidStatus === "jwtExpired";
  },

  hasIntroductionText: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.credentialType),
      O.chainNullableK(type => context.credentialsCatalogue?.[type]),
      O.map(metadata => !!metadata.authentic_sources[0]?.user_information),
      O.getOrElse(constFalse)
    )
});
