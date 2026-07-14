import {
  createCryptoContextFor,
  type ItwVersion
} from "@pagopa/io-react-native-wallet";

import { getAppVersion } from "../../../../utils/appVersion";
import { assert } from "../../../../utils/assert";
import { createItWalletFetch } from "../../api/client";
import { WALLET_SOLUTION_ID } from "./constants";
import { Env } from "./environment.ts";
import {
  createKeyAttestationCryptoContextFor,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import {
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "./itwIntegrityUtils";
import { getIoWallet } from "./itwIoWallet";
import { WalletInstanceAttestations } from "./itwTypesUtils.ts";

/**
 * Getter for the integrity hardware keytag to be used for an
 * {@link IntegrityContext}.
 *
 * @returns The integrity hardware keytag to be persisted
 */
export const getIntegrityHardwareKeyTag = async (): Promise<string> =>
  await generateIntegrityHardwareKeyTag();

/**
 * Register a new wallet instance with hardwareKeyTag.
 *
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param hardwareKeyTag - The hardware key tag of the integrity Context
 * @param sessionToken - The session token to use for the API calls
 * @param options - Options to specify if the registration is for a renewal or
 *   not
 */
export const registerWalletInstance = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  itwVersion: ItwVersion,
  hardwareKeyTag: string,
  sessionToken: string,
  options?: { isRenewal?: boolean }
) => {
  const ioWallet = getIoWallet(itwVersion);
  const integrityContext = getIntegrityContext(hardwareKeyTag);
  // This must be used only for API calls mediated through our backend which are related to the wallet instance only
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );
  await ioWallet.WalletInstance.createWalletInstance({
    integrityContext,
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    isRenewal: options?.isRenewal,
    appFetch
  });
};

/**
 * Getter for the wallet attestation binded to the wallet instance created with
 * the given hardwareKeyTag.
 *
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param hardwareKeyTag - The hardware key tag of the wallet instance
 * @param sessionToken - The session token to use for the API calls
 * @returns The wallet attestation in multiple formats
 */
export const getWalletInstanceAttestation = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  itwVersion: ItwVersion,
  hardwareKeyTag: string,
  sessionToken: string
): Promise<WalletInstanceAttestations> => {
  const ioWallet = getIoWallet(itwVersion);
  const integrityContext = getIntegrityContext(hardwareKeyTag);

  await regenerateCryptoKey(WIA_KEYTAG);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );

  const attestations = await ioWallet.WalletInstanceAttestation.getAttestation(
    {
      walletSolutionId: WALLET_SOLUTION_ID,
      walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
      walletSolutionVersion: getAppVersion()
    },
    {
      wiaCryptoContext,
      integrityContext,
      appFetch
    }
  );

  return attestations.reduce(
    (acc, { format, attestation }) => ({
      ...acc,
      [format]: attestation
    }),
    {} as WalletInstanceAttestations
  );
};

/**
 * Checks if the Wallet Instance Attestation needs to be requested by checking
 * the expiry date
 *
 * @param itwVersion - IT-Wallet technical specs version
 * @param attestation - The Wallet Instance Attestation to validate
 * @returns True if the Wallet Instance Attestation is expired or not present
 */
export const isWalletInstanceAttestationValid = (
  itwVersion: ItwVersion,
  attestation: string
): boolean => {
  const ioWallet = getIoWallet(itwVersion);
  // To keep things simple we store the old and new attestation under the same key,
  // so we might end up with a valid old attestation for the new flow.
  // We let decoding fail and catch the error to force the correct attestation to be fetched again.
  try {
    const decoded = ioWallet.WalletInstanceAttestation.decode(attestation);
    const expiryDate = new Date(decoded.exp * 1000);
    const now = new Date();
    return now < expiryDate;
  } catch {
    return false;
  }
};

/**
 * Get the wallet instance status from the Wallet Provider. This operation is
 * more lightweight than getting a new attestation to check the status.
 *
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param hardwareKeyTag The hardware key tag used to create the wallet instance
 * @param sessionToken The session token to use for the API calls
 */
export const getWalletInstanceStatus = (
  { WALLET_PROVIDER_BASE_URL }: Env,
  itwVersion: ItwVersion,
  hardwareKeyTag: string,
  sessionToken: string
) =>
  getIoWallet(itwVersion).WalletInstance.getWalletInstanceStatus({
    id: hardwareKeyTag,
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    appFetch: createItWalletFetch(
      sessionToken,
      WALLET_PROVIDER_BASE_URL,
      WALLET_PROVIDER_BASE_URL
    )
  });

/**
 * Get the current wallet instance status from the Wallet Provider. This
 * operation will check the wallet instance status based on the current fiscal
 * code of the user.
 *
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param sessionToken The session token to use for the API calls
 * @throws Error if the wallet instance status retrieval fails
 */
export const getCurrentWalletInstanceStatus = (
  { WALLET_PROVIDER_BASE_URL }: Env,
  itwVersion: ItwVersion,
  sessionToken: string
) => {
  const ioWallet = getIoWallet(itwVersion);

  return ioWallet.WalletInstance.getCurrentWalletInstanceStatus({
    walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
    appFetch: createItWalletFetch(
      sessionToken,
      WALLET_PROVIDER_BASE_URL,
      WALLET_PROVIDER_BASE_URL
    )
  });
};

export const getWalletUnitAttestation = async (
  { WALLET_PROVIDER_BASE_URL }: Env,
  itwVersion: ItwVersion,
  keyTags: ReadonlyArray<string>,
  hardwareKeyTag: string,
  sessionToken: string
) => {
  const ioWallet = getIoWallet(itwVersion);

  assert(
    ioWallet.WalletUnitAttestation.isSupported,
    `Wallet Unit Attestation is not supported by IT-Wallet v${itwVersion}`
  );

  const integrityContext = getIntegrityContext(hardwareKeyTag);
  const appFetch = createItWalletFetch(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    WALLET_PROVIDER_BASE_URL
  );

  const { attestation } = await ioWallet.WalletUnitAttestation.getAttestation(
    {
      walletSolutionId: WALLET_SOLUTION_ID,
      walletProviderBaseUrl: WALLET_PROVIDER_BASE_URL,
      walletSolutionVersion: getAppVersion()
    },
    {
      keysToAttest: keyTags.map(createKeyAttestationCryptoContextFor),
      integrityContext,
      appFetch
    }
  );

  return attestation;
};
