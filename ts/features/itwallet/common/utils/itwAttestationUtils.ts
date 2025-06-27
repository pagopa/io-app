import {
  createCryptoContextFor,
  IntegrityContext,
  WalletInstance,
  WalletInstanceAttestation as WalletInstanceAttestationV1
} from "@pagopa/io-react-native-wallet";
import { WalletInstanceAttestation as WalletInstanceAttestationV2 } from "@pagopa/io-react-native-wallet-v2";
import * as Sentry from "@sentry/react-native";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";
import { regenerateCryptoKey, WIA_KEYTAG } from "./itwCryptoContextUtils";
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "./itwIntegrityUtils";
import { WalletInstanceAttestations } from "./itwTypesUtils.ts";
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
 * @param newApiEnabled - enable v1.0 API - TODO: [SIW-2530] Remove after transitioning to API 1.0
 * @return the wallet attestation in multiple formats
 */
export const getAttestation = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  hardwareKeyTag: string,
  sessionToken: SessionToken,
  newApiEnabled: boolean = false
): Promise<WalletInstanceAttestations> => {
  const WalletInstanceAttestation = newApiEnabled
    ? WalletInstanceAttestationV2
    : WalletInstanceAttestationV1;

  const integrityContext = getIntegrityContext(hardwareKeyTag);

  await regenerateCryptoKey(WIA_KEYTAG);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );

  const attestation = await WalletInstanceAttestation.getAttestation({
    wiaCryptoContext,
    integrityContext,
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    appFetch
  });

  // Handle legacy attestation format
  if (typeof attestation === "string") {
    return { jwt: attestation };
  }

  return attestation.reduce(
    (acc, { format, wallet_attestation }) => ({
      ...acc,
      [format]: wallet_attestation
    }),
    {} as WalletInstanceAttestations
  );
};

/**
 * Checks if the Wallet Instance Attestation needs to be requested by
 * checking the expiry date
 * @param attestation - the Wallet Instance Attestation to validate
 * @param newApiEnabled - enable v1.0 API - TODO: [SIW-2530] Remove after transitioning to API 1.0
 * @returns true if the Wallet Instance Attestation is expired or not present
 */
export const isWalletInstanceAttestationValid = (
  attestation: string,
  newApiEnabled: boolean = false
): boolean => {
  const WalletInstanceAttestation = newApiEnabled
    ? WalletInstanceAttestationV2
    : WalletInstanceAttestationV1;
  // To keep things simple we store the old and new attestation under the same key,
  // so we might end up with a valid old attestation for the new flow.
  // We let decoding fail and catch the error to force the correct attestation to be fetched again.
  try {
    const { payload } = WalletInstanceAttestation.decode(attestation);
    const expiryDate = new Date(payload.exp * 1000);
    const now = new Date();
    return now < expiryDate;
  } catch {
    return false;
  }
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
    Sentry.captureException(e, {
      tags: {
        isRequired: true
      }
    });
    throw e;
  }
};
