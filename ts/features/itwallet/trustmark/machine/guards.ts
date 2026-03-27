import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { AnyEventObject } from "xstate";
import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { Context } from "./context";

export const createItwTrustmarkGuardsImplementation = (
  itwVersion: ItwVersion
) => ({
  isSessionExpired: ({ event }: { event: AnyEventObject }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.walletInstanceAttestation?.jwt),
      O.map(attestation =>
        isWalletInstanceAttestationValid(itwVersion, attestation)
      ),
      O.getOrElse(() => false)
    )
});
