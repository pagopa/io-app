import { generate } from "@pagopa/io-react-native-crypto";
import {
  IntegrityContext,
  WalletInstance,
  WalletInstanceAttestation,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import uuid from "react-native-uuid";
import { itwWalletProviderBaseUrl } from "../../../../config";
import { defaultRetryingFetch } from "../../../../utils/fetch";
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
export const registerWalletInstance = async (hardwareKeyTag: string) => {
  const integrityContext = getIntegrityContext(hardwareKeyTag);
  // Check if the wallet instance has been revoked
  await WalletInstance.createWalletInstance({
    integrityContext,
    walletProviderBaseUrl: itwWalletProviderBaseUrl,
    appFetch: defaultRetryingFetch()
  });
};

/**
 * Getter for the wallet attestation binded to the wallet instance created with the given hardwareKeyTag.
 * @param hardwareKeyTag - the hardware key tag of the wallet instance
 * @return the wallet attestation
 */
export const getAttestation = async (
  hardwareKeyTag: string
): Promise<string> => {
  const integrityContext = getIntegrityContext(hardwareKeyTag);

  const ephemeralKey = uuid.v4().toString();

  await generate(ephemeralKey);
  const wiaCryptoContext = createCryptoContextFor(ephemeralKey);

  return WalletInstanceAttestation.getAttestation({
    wiaCryptoContext,
    integrityContext,
    walletProviderBaseUrl: itwWalletProviderBaseUrl,
    appFetch: defaultRetryingFetch()
  });
};
