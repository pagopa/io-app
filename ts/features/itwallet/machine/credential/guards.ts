import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { useIOStore } from "../../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { Context } from "./context";
import { CredentialIssuanceEvents, SelectCredential } from "./events";
import { CredentialIssuanceFailureType } from "./failure";

const isSelectCredentialEvent = (
  event: CredentialIssuanceEvents
): event is SelectCredential => event.type === "select-credential";

export const createCredentialIssuanceGuardsImplementation = () => {
// eslint-disable-next-line react-hooks/rules-of-hooks
  const store = useIOStore();

  return {
    isSessionExpired: ({ event }: { event: CredentialIssuanceEvents }) =>
      "error" in event && event.error instanceof ItwSessionExpiredError,

    isDeferredIssuance: ({ context }: { context: Context }) =>
      context.failure?.type === CredentialIssuanceFailureType.ASYNC_ISSUANCE,

    hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
      pipe(
        O.fromNullable(context.walletInstanceAttestation),
        O.map(isWalletInstanceAttestationValid),
        O.getOrElse(() => false)
      ),

    isStatusError: ({ context }: { context: Context }) =>
      context.failure?.type === CredentialIssuanceFailureType.INVALID_STATUS,

    isSkipNavigation: ({ event }: { event: CredentialIssuanceEvents }) =>
      isSelectCredentialEvent(event) && event.skipNavigation === true,

    isWalletValid: () => itwLifecycleIsValidSelector(store.getState())
  };
};
