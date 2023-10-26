import {
  WalletInstanceAttestation,
  Trust,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { getOrGenerateCyptoKey } from "./keychain";

/**
 * The key alias used to store the WIA crypto key in the keychain.
 */
export const ITW_WIA_KEY_TAG = "ITW_WIA_CRYTPO";

/**
 * Getter for the Wallet Instance Attestation.
 * It generates a new key pair and uses it to sign the attestation request.
 * @returns the WIA attestation
 */
export const getWia = async (
  entityConfiguration: Trust.WalletProviderEntityConfiguration
) => {
  await getOrGenerateCyptoKey(ITW_WIA_KEY_TAG);
  const wiaCryptoContext = createCryptoContextFor(ITW_WIA_KEY_TAG);
  const issuingAttestation = WalletInstanceAttestation.getAttestation({
    wiaCryptoContext
  });
  return await issuingAttestation(entityConfiguration);
};
