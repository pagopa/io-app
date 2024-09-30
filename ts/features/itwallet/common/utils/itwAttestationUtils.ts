import {
  createCryptoContextFor,
  IntegrityContext,
  WalletInstance,
  WalletInstanceAttestation
} from "@pagopa/io-react-native-wallet";
import { itwWalletProviderBaseUrl } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";
import { regenerateCryptoKey, WIA_KEYTAG } from "./itwCryptoContextUtils";
import {
  ensureIntegrityServiceIsReady,
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "./itwIntegrityUtils";

/**
 * Getter for the integrity hardware keytag to be used for an {@link IntegrityContext}.
 * @return the integrity hardware keytag to be persisted
 */
export const getIntegrityHardwareKeyTag = async (): Promise<string> => {
  await ensureIntegrityServiceIsReady();
  return await generateIntegrityHardwareKeyTag();
};

/**
 * Register a new wallet instance with hardwareKeyTag.
 * @param hardwareKeyTag - the hardware key tag of the integrity Context
 */
export const registerWalletInstance = async (
  hardwareKeyTag: string,
  sessionToken: SessionToken
) => {
  const integrityContext = getIntegrityContext(hardwareKeyTag);
  // Check if the wallet instance has been revoked
  // This must be used only for API calls mediated through our backend which are related to the wallet instance only
  const appFetch = createItWalletFetch(itwWalletProviderBaseUrl, sessionToken);
  await WalletInstance.createWalletInstance({
    integrityContext,
    walletProviderBaseUrl: itwWalletProviderBaseUrl,
    appFetch
  });
};

export type WalletAttestationResult = {
  walletAttestation: string;
};

/**
 * Getter for the wallet attestation binded to the wallet instance created with the given hardwareKeyTag.
 * @param hardwareKeyTag - the hardware key tag of the wallet instance
 * @return the wallet attestation and the related key tag
 */
export const getAttestation = async (
  hardwareKeyTag: string,
  sessionToken: SessionToken
): Promise<WalletAttestationResult> => {
  const integrityContext = getIntegrityContext(hardwareKeyTag);

  await regenerateCryptoKey(WIA_KEYTAG);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const appFetch = createItWalletFetch(itwWalletProviderBaseUrl, sessionToken);

  const walletAttestation = await WalletInstanceAttestation.getAttestation({
    wiaCryptoContext,
    integrityContext,
    walletProviderBaseUrl: itwWalletProviderBaseUrl,
    appFetch
  });

  return { walletAttestation };
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
  return now > expiryDate;
};
