import { Platform } from "react-native";
import { deleteKey, generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  KeyAttestationCryptoContext
} from "@pagopa/io-react-native-wallet";
import { getAttestation as getAttestationIntegrity } from "@pagopa/io-react-native-integrity";
import { constNull } from "fp-ts/lib/function";

// Key tags
export const WIA_KEYTAG = "WIA_KEYTAG";
export const DPOP_KEYTAG = "DPOP_KEYTAG";

export const regenerateCryptoKey = (keyTag: string) =>
  deleteKey(keyTag)
    .catch(constNull)
    .finally(() => generate(keyTag));

/**
 * Create an extended CryptoContext bound to the provided key tag suitable for Android key attestation.
 *
 * In contrast to the standard CryptoContext the key must not be generated outside,
 * as `generateKeyWithAttestation` handles key generation with attestation on Android.
 *
 * @param keyTag The tag to reference the cryptographic key
 * @returns KeyAttestationCryptoContext
 */
export const createKeyAttestationCryptoContextFor = (
  keyTag: string
): KeyAttestationCryptoContext => ({
  ...createCryptoContextFor(keyTag),
  generateKeyWithAttestation(challenge) {
    return Platform.select({
      android: async () => {
        const attestation = await getAttestationIntegrity(challenge, keyTag);
        return { success: true, attestation };
      },
      // No key attestation on iOS, only key pair creation
      ios: async () => {
        await generate(keyTag);
        return { success: true };
      },
      default: () => {
        throw new Error("Unsupported platform");
      }
    })();
  }
});
