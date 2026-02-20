import { WalletInstance } from "@pagopa/io-react-native-wallet";
import * as Sentry from "@sentry/react-native";
import { createItWalletFetch } from "../../api/client";
import { Env } from "./environment";

/**
 * Revoke the current wallet instance.
 * @param env - The environment to use for the wallet provider base URL
 * @param sessionToken - The IO session token
 * @param integrityKeyTag - The integrity key tag used for the wallet instance creation
 */
export const revokeCurrentWalletInstance = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  sessionToken: string,
  integrityKeyTag: string
): Promise<void> => {
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );
  try {
    await WalletInstance.revokeWalletInstance({
      walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
      id: integrityKeyTag,
      appFetch
    });
  } catch (e) {
    Sentry.captureException(e);
    throw e;
  }
};
