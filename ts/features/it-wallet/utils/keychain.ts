import { generate, getPublicKey } from "@pagopa/io-react-native-crypto";

/**
 * Getter for the public key used to sign the WIA attestation.
 * This method tries to generate a new crypto key pair but if it already exists it returns the already existing one.
 * Note that at the moment the generate function rejects the promise without a CryptoError if the key already exists.
 * It does rejects the promise with a CryptoError if the key generation fails.
 * In the future we should change the generate function to reject with a CryptoError if the key already exists, thus allowing us
 * to better handle the error case and call getPublicKey only if generate fails due to an already existing key.
 * @returns the public key used to sign the WIA attestation.
 */
export const generateCryptoKey = async (keyTag: string) =>
  generate(keyTag).catch(_ => getPublicKey(keyTag));
