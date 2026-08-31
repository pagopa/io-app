import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { useIOStore } from "../../../../store/hooks";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import { itwCredentialIntroContentSelector } from "../../credentialsCatalogue/store/selectors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

export const createCredentialIssuanceGuardsImplementation = (
  store: ReturnType<typeof useIOStore>,
  itwVersion: ItwVersion
) => ({
  isSessionExpired: ({ event }: { event: CredentialIssuanceEvents }) =>
    "error" in event && event.error instanceof ItwSessionExpiredError,

  hasValidWalletInstanceAttestation: ({ context }: { context: Context }) => {
    const attestation = context.walletInstanceAttestation?.jwt;
    if (!attestation) {
      return false;
    }
    return isWalletInstanceAttestationValid(itwVersion, attestation);
  },

  isEidExpired: () => {
    const eidStatus = itwCredentialsEidStatusSelector(store.getState());

    return eidStatus === "jwtExpired";
  },

  hasCredentialIntroContent: ({ context }: { context: Context }) => {
    if (!context.credentialType) {
      return false;
    }
    const credentialIntroContent = itwCredentialIntroContentSelector(
      context.credentialType
    )(store.getState());
    return Boolean(credentialIntroContent);
  }
});
