import { WalletInstance } from "@pagopa/io-react-native-wallet";
import { itwWalletProviderBaseUrl } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";

/**
 * Revoke the current wallet instance.
 * @param sessionToken
 */
export const revokeCurrentWalletInstance = async (
  sessionToken: SessionToken,
  integrityKeyTag: string
): Promise<void> => {
  const appFetch = createItWalletFetch(itwWalletProviderBaseUrl, sessionToken);

  await WalletInstance.revokeWalletInstance({
    walletProviderBaseUrl: itwWalletProviderBaseUrl,
    id: integrityKeyTag,
    appFetch
  });
};
