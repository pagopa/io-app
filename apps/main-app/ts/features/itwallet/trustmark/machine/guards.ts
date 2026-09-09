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
}: GuardArgs) => {
  const attestation = context.walletInstanceAttestation?.jwt;
  return (
    attestation !== undefined &&
    isWalletInstanceAttestationValid(context.deps.itwVersion, attestation)
  );
};
