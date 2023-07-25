import {
  CryptoError,
  generate,
  getPublicKey,
  sign
} from "@pagopa/io-react-native-crypto";
import { WalletInstanceAttestation } from "@pagopa/io-react-native-wallet";
import { walletProviderUrl } from "../../../config";

/**
 * The key alias used to store the WIA crypto key in the keychain.
 */
export const ITW_WIA_CRYPTO_KEY = "ITW_WIA_CRYTPO";

/**
 * Getter for the public key used to sign the WIA attestation.
 * This method tries to generate a new crypto key pair but if it already exists it returns already existing one.
 * @returns the public key used to sign the WIA attestation.
 */
export const getWiaPublicKey = async () => {
  try {
    return await generate(ITW_WIA_CRYPTO_KEY);
  } catch (e) {
    const { message } = e as CryptoError;
    if (message === "KEY_ALREADY_EXISTS") {
      return await getPublicKey(ITW_WIA_CRYPTO_KEY);
    } else {
      throw e;
    }
  }
};

/**
 * Getter for the Wallet Instance Attestation.
 * It generates a new key pair and uses it to sign the attestation request.
 * @returns the WIA attestation
 */
export const getWia = async () => {
  const publicKey = await getWiaPublicKey();
  const issuing = new WalletInstanceAttestation.Issuing(walletProviderUrl);
  const attestationRequest = await issuing.getAttestationRequestToSign(
    publicKey
  );
  const signature = await sign(attestationRequest, ITW_WIA_CRYPTO_KEY);
  return (
    await issuing.getAttestation(attestationRequest, signature)
  ).toString();
};
