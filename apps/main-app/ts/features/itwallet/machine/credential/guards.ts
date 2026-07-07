import { ItwVersion } from "@pagopa/io-react-native-wallet";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { useIOStore } from "../../../../store/hooks";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import { itwCredentialsCatalogueByTypesSelector } from "../../credentialsCatalogue/store/selectors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";
import { CredentialIssuanceFailureType } from "./failure";

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

  isStatusError: ({ context }: { context: Context }) =>
    context.failure?.type === CredentialIssuanceFailureType.INVALID_STATUS,

  isEidExpired: () => {
    const eidStatus = itwCredentialsEidStatusSelector(store.getState());

    return eidStatus === "jwtExpired";
  },

  hasCredentialIntroContent: ({ context }: { context: Context }) => {
    if (!context.credentialType) {
      return false;
    }
    const credentialsCatalogue = itwCredentialsCatalogueByTypesSelector(
      store.getState()
    );
    const { authentic_sources } =
      credentialsCatalogue?.[context.credentialType] ?? {};
    return Boolean(
      authentic_sources?.[0].user_information_l10n_id ||
      authentic_sources?.[0].user_information
    );
  }
});
