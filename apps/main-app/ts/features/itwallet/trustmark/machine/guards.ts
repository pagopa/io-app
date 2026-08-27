import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { AnyEventObject } from "xstate";

import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { Context } from "./context";

export const createItwTrustmarkGuardsImplementation = (
  itwVersion: ItwVersion
) => ({
  isSessionExpired: ({ event }: { event: AnyEventObject }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) => {
    const attestation = context.walletInstanceAttestation?.jwt;
    return (
      attestation !== undefined &&
      isWalletInstanceAttestationValid(itwVersion, attestation)
    );
  }
});
