import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { AnyEventObject } from "xstate";

import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { Context } from "./context";

type GuardArgs = {
  context: Context;
  event: AnyEventObject;
};

export const isSessionExpiredGuard = ({ event }: GuardArgs) =>
  "error" in event && event.error instanceof ItwSessionExpiredError;

export const hasValidWalletInstanceAttestationGuard = ({
  context
}: GuardArgs) =>
  pipe(
    O.fromNullable(context.walletInstanceAttestation?.jwt),
    O.map(attestation =>
      isWalletInstanceAttestationValid(context.deps.itwVersion, attestation)
    ),
    O.getOrElse(() => false)
  );
