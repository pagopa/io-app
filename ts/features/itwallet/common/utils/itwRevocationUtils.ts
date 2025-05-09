import { WalletInstance } from "@pagopa/io-react-native-wallet";
import { itwWalletProviderBaseUrl } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";
import { sendExceptionToSentry } from "../../../../utils/sentryUtils";

/**
 * Revoke the current wallet instance.
 * @param sessionToken
 */
export const revokeCurrentWalletInstance = async (
  sessionToken: SessionToken,
  integrityKeyTag: string
): Promise<void> => {
  const appFetch = createItWalletFetch(itwWalletProviderBaseUrl, sessionToken);
  try {
    await WalletInstance.revokeWalletInstance({
      walletProviderBaseUrl: itwWalletProviderBaseUrl,
      id: integrityKeyTag,
      appFetch
    });
  } catch (e) {
    sendExceptionToSentry(e, "revokeWalletInstance");
    throw new Error("Error revoking wallet instance");
  }
};
