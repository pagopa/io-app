import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { AnyEventObject } from "xstate";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { Context } from "./context";

export const createItwTrustmarkGuardsImplementation = () => ({
  isSessionExpired: ({ event }: { event: AnyEventObject }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) =>
    pipe(
      O.fromNullable(context.walletInstanceAttestation?.jwt),
      O.map(isWalletInstanceAttestationValid),
      O.getOrElse(() => false)
    )
});
