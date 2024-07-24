import { deleteKey, generate } from "@pagopa/io-react-native-crypto";
import {
  IntegrityContext,
  WalletInstance,
  WalletInstanceAttestation,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { constNull } from "fp-ts/lib/function";
import { itwWalletProviderBaseUrl } from "../../../../config";
import { createItWalletFetch } from "../../api/client";
import { SessionToken } from "../../../../types/SessionToken";
import {
  ensureIntegrityServiceIsReady,
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
} from "./itwIntegrityUtils";

const WIA_EID_KEYTAG = "WIA_EID_KEYTAG";

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
  wiaCryptoContext: CryptoContext;
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

  await deleteKey(WIA_EID_KEYTAG)
    .catch(constNull)
    .finally(() => generate(WIA_EID_KEYTAG));

  const wiaCryptoContext = createCryptoContextFor(WIA_EID_KEYTAG);

  const appFetch = createItWalletFetch(itwWalletProviderBaseUrl, sessionToken);

  const walletAttestation = await WalletInstanceAttestation.getAttestation({
    wiaCryptoContext,
    integrityContext,
    walletProviderBaseUrl: itwWalletProviderBaseUrl,
    appFetch
  });

  return { walletAttestation, wiaCryptoContext };
};

export const disposeWalletAttestation = () =>
  deleteKey(WIA_EID_KEYTAG).catch(constNull);
