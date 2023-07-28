import {
  CryptoError,
  deleteKey,
  generate
} from "@pagopa/io-react-native-crypto";

/**
 * Getter for the public key used to sign the WIA attestation.
 * This method tries to generate a new crypto key pair but if it already exists it returns already existing one.
 * @returns the public key used to sign the WIA attestation.
 */
export const generateCryptoKey = async (keyTag: string) => {
  try {
    await deleteKey(keyTag);
  } catch (e) {
    const { message } = e as CryptoError;
    if (message !== "PUBLIC_KEY_NOT_FOUND") {
      throw e;
    }
  }
  return await generate(keyTag);
};
