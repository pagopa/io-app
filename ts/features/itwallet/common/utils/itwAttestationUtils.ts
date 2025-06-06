import {
  createCryptoContextFor,
  IntegrityContext,
  WalletInstance,
  WalletInstanceAttestation
} from "@pagopa/io-react-native-wallet";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";
import { sendExceptionToSentry } from "../../../../utils/sentryUtils.ts";
import { regenerateCryptoKey, WIA_KEYTAG } from "./itwCryptoContextUtils";
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "./itwIntegrityUtils";
import { Env } from "./environment.ts";

/**
 * Getter for the integrity hardware keytag to be used for an {@link IntegrityContext}.
 * @return the integrity hardware keytag to be persisted
 */
export const getIntegrityHardwareKeyTag = async (): Promise<string> =>
  await generateIntegrityHardwareKeyTag();

/**
 * Register a new wallet instance with hardwareKeyTag.
 * @param env - The environment to use for the wallet provider base URL
 * @param hardwareKeyTag - the hardware key tag of the integrity Context
 * @param sessionToken - the session token to use for the API calls
 */
export const registerWalletInstance = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken
) => {
  const integrityContext = getIntegrityContext(hardwareKeyTag);
  // Check if the wallet instance has been revoked
  // This must be used only for API calls mediated through our backend which are related to the wallet instance only
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );
  await WalletInstance.createWalletInstance({
    integrityContext,
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    appFetch
  });
};

/**
 * Getter for the wallet attestation binded to the wallet instance created with the given hardwareKeyTag.
 * @param env - The environment to use for the wallet provider base URL
 * @param hardwareKeyTag - the hardware key tag of the wallet instance
 * @param sessionToken - the session token to use for the API calls
 * @return the wallet attestation and the related key tag
 */
export const getAttestation = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken
): Promise<string> => {
  const integrityContext = getIntegrityContext(hardwareKeyTag);

  await regenerateCryptoKey(WIA_KEYTAG);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );

  return await WalletInstanceAttestation.getAttestation({
    wiaCryptoContext,
    integrityContext,
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    appFetch
  });
};

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param attestation - the Wallet Instance Attestation to validate
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const isWalletInstanceAttestationValid = (
  attestation: string
): boolean => {
  const { payload } = WalletInstanceAttestation.decode(attestation);
  const expiryDate = new Date(payload.exp * 1000);
  const now = new Date();
  return now < expiryDate;
};

/**
 * Get the wallet instance status from the Wallet Provider.
 * This operation is more lightweight than getting a new attestation to check the status.
 * @param env - The environment to use for the wallet provider base URL
 * @param hardwareKeyTag The hardware key tag used to create the wallet instance
 * @param sessionToken The session token to use for the API calls
 */
export const getWalletInstanceStatus = (
  { WALLET_PROVIDER_BASE_URL }: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken
) =>
  WalletInstance.getWalletInstanceStatus({
    id: hardwareKeyTag,
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    appFetch: createItWalletFetch(
      sessionToken,
      WALLET_PROVIDER_BASE_URL,
      WALLET_PROVIDER_BASE_URL
    )
  });

/**
 * Get the current wallet instance status from the Wallet Provider.
 * This operation will check the wallet instance status based on the current fiscal code of the user.
 * @param env - The environment to use for the wallet provider base URL
 * @param sessionToken The session token to use for the API calls
 */
export const getCurrentWalletInstanceStatus = (
  { WALLET_PROVIDER_BASE_URL }: Env,
  sessionToken: SessionToken
) => {
  try {
    return WalletInstance.getCurrentWalletInstanceStatus({
      walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
      appFetch: createItWalletFetch(
        sessionToken,
        WALLET_PROVIDER_BASE_URL,
        WALLET_PROVIDER_BASE_URL
      )
    });
  } catch (e) {
    sendExceptionToSentry(e, "getCurrentWalletInstanceStatus");
    throw e;
  }
};
