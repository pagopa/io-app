import { GlobalState } from "../../../../../store/reducers/types";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { CredentialValidity } from "../../../common/utils/itwTypesUtils";
import { itwAllStoredCredentialsSelector } from "../../../credentials/store/selectors";
import { itwWalletUnitAttestationsSelector } from "../../../walletInstance/store/selectors";

/**
 * Collects the Status List URIs referenced by all current owners
 * (credentials and Wallet Unit Attestations).
 *
 * Invalid or unsupported owner data is ignored because it cannot reference a
 * Status List that can be used by the wallet.
 */
export const itwStatusListReferencedUrisSelector = (
  state: GlobalState
): ReadonlyArray<string> => {
  const wallet = getIoWallet(selectItwSpecsVersion(state));

  const credentials = itwAllStoredCredentialsSelector(state);
  const credentialUris = credentials
    .filter(c => c.validity?.type === "status_list")
    .map(c => (c.validity as CredentialValidity).statusList.uri);

  const walletUnitAttestations = itwWalletUnitAttestationsSelector(state);
  const walletUnitAttestationUris = Object.values(
    walletUnitAttestations
  ).flatMap(wua => {
    try {
      if (!wallet.WalletUnitAttestation.isSupported) {
        return [];
      }
      return [wallet.WalletUnitAttestation.decode(wua).status.status_list.uri];
    } catch {
      return [];
    }
  });

  return [...credentialUris, ...walletUnitAttestationUris];
};
