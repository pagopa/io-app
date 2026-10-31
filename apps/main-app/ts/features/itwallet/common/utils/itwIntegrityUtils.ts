import { sign } from "@pagopa/io-react-native-crypto";
import {
  decodeAssertion,
  generateHardwareKey,
  generateHardwareSignatureWithAssertion,
  getAttestationAssertion,
  getAttestation as getAttestationIntegrity,
  getHardwareAttestationCapabilities,
  HardwareAttestationCapabilities,
  isAttestationServiceAvailable,
  prepareIntegrityToken,
  requestIntegrityToken
} from "@pagopa/io-react-native-integrity";
import { addPadding, removePadding } from "@pagopa/io-react-native-jwt";
import { IntegrityContext } from "@pagopa/io-react-native-wallet";
import { Platform } from "react-native";
import sha from "sha.js";
import { v4 as uuidv4 } from "uuid";

import { Env } from "./environment";

/**
 * Type returned by the getHardwareSignatureWithAuthData function of
 * {@link IntegrityContext}. It contains the signature and the integrity proofs:
 * the authenticator data (iOS assertion or Android Play Integrity token) and,
 * on Android, a fresh hardware key attestation.
 */
type HardwareSignatureWithAuthData = {
  authenticatorData?: string;
  hardwareKeyAttestation?: string;
  signature: string;
};

/**
 * Checks whether the device can produce the fresh hardware key attestation
 * which the Wallet Provider accepts in place of the Play Integrity token. It
 * requires hardware key attestation (devices launched with Android 8.0 or
 * later) and app attest keys (Android 12 or later), as the fresh key
 * attestation is accepted only when signed by the attest key registered with
 * the wallet instance. Otherwise Play Integrity is required.
 *
 * @param capabilities - The hardware attestation capabilities of the device
 * @returns Whether the hardware key attestation can be used as fallback
 */
const isHardwareIntegrityProofSupported = ({
  hasAttestKey,
  isHardwareAttestationSupported
}: HardwareAttestationCapabilities) =>
  isHardwareAttestationSupported && hasAttestKey;

/**
 * Requests the Android integrity proofs for the given client data hash: the
 * Play Integrity token and, when supported, a fresh key attestation pinned to
 * the attest key of the hardware key. The Wallet Provider verifies the Play
 * Integrity token and, as fallback, the key attestation, which allows devices
 * running GrapheneOS with a locked bootloader, where Play Integrity is not
 * available.
 *
 * @param clientDataHash - The SHA-256 hex digest of the client data
 * @param hardwareKeyTag - The hardware key tag
 * @param withKeyAttestation - Whether to request the fresh key attestation
 * @returns The available proofs, it rejects with the Play Integrity error when
 *   none is available
 */
const getAndroidIntegrityProofs = async (
  clientDataHash: string,
  hardwareKeyTag: string,
  withKeyAttestation: boolean
) => {
  const [integrityToken, keyAttestation] = await Promise.allSettled([
    requestIntegrityToken(clientDataHash),
    withKeyAttestation
      ? getAttestationAssertion(clientDataHash, hardwareKeyTag)
      : Promise.resolve(undefined)
  ]);
  const hardwareKeyAttestation =
    keyAttestation.status === "fulfilled" ? keyAttestation.value : undefined;
  if (integrityToken.status === "rejected" && !hardwareKeyAttestation) {
    throw integrityToken.reason;
  }
  return {
    authenticatorData:
      integrityToken.status === "fulfilled" ? integrityToken.value : undefined,
    hardwareKeyAttestation
  };
};

/**
 * Generates the hardware signature with the authentication data. The
 * implementation differs between iOS and Android. This will later be used to
 * verify the signature on the server side.
 *
 * @param hardwareKeyTag - The hardware key tag to use for the signature.
 * @returns A function that takes the client data as string and returns a
 *   promise that resolves with the signature and the authenticator data or
 *   rejects with an error.
 */
const getHardwareSignatureWithAuthData = (
  hardwareKeyTag: string,
  clientData: string
): Promise<HardwareSignatureWithAuthData> =>
  Platform.select<() => Promise<HardwareSignatureWithAuthData>>({
    ios: async () => {
      const base64KeyTag = addPadding(hardwareKeyTag);
      const assertion = await generateHardwareSignatureWithAssertion(
        clientData,
        base64KeyTag
      );
      return await decodeAssertion(assertion);
    },
    android: async () => {
      const signature = await sign(clientData, hardwareKeyTag);
      const clientDataHash = sha("sha256").update(clientData).digest("hex");
      const capabilities = await getHardwareAttestationCapabilities();
      const proofs = await getAndroidIntegrityProofs(
        clientDataHash,
        hardwareKeyTag,
        isHardwareIntegrityProofSupported(capabilities)
      );
      return { signature, ...proofs };
    },
    default: async () => Promise.reject(new Error("Unsupported platform"))
  })();

/**
 * Generates the hardware backed key for the current platform. iOS or Android
 * are supported.
 *
 * @returns A promise that resolves with the key tag as string or rejects with
 *   an error.
 */
const generateIntegrityHardwareKeyTag = () =>
  Platform.select({
    ios: async () => {
      const key = await generateHardwareKey();
      return removePadding(key);
    },
    android: async () =>
      // Here we generate a random uuid but the key is generated by getAttestation method of io-react-native-integrity package.
      uuidv4().toString(),
    default: () => Promise.reject(new Error("Unsupported platform"))
  })();

/**
 * Ensures the integrity service is ready on the device.
 *
 * On Android the service is ready when Google Play Services is available or the
 * device can produce the hardware key attestation used as fallback when Play
 * Integrity is not available, e.g. on devices running GrapheneOS, see
 * {@link isHardwareIntegrityProofSupported}.
 *
 * @param env - The environment to use for the Google Cloud Project Number
 * @returns A promise with resolves with a boolean value indicating whether the
 *   integrity service is available.
 */
const ensureIntegrityServiceIsReady = ({ GOOGLE_CLOUD_PROJECT_NUMBER }: Env) =>
  Platform.select({
    ios: async () => await isAttestationServiceAvailable(),
    android: async () => {
      const capabilities = await getHardwareAttestationCapabilities();
      const isHardwareProofSupported =
        isHardwareIntegrityProofSupported(capabilities);
      if (capabilities.isPlayServicesAvailable) {
        try {
          await prepareIntegrityToken(GOOGLE_CLOUD_PROJECT_NUMBER);
        } catch (e) {
          if (!isHardwareProofSupported) {
            throw e;
          }
        }
      }
      return capabilities.isPlayServicesAvailable || isHardwareProofSupported;
    },
    default: () => Promise.reject(new Error("Unsupported platform"))
  })();

/**
 * Ensures that the hardwareKeyTag as padding added before calling
 * {@see getAttestationIntegrity}
 */
const getAttestation = (challenge: string, hardwareKeyTag: string) =>
  Platform.select({
    ios: () => getAttestationIntegrity(challenge, addPadding(hardwareKeyTag)),
    // The attest key allows the Wallet Provider to pin the device and to verify
    // the fresh key attestations sent with each assertion
    android: () =>
      getAttestationIntegrity(challenge, hardwareKeyTag, {
        useAttestKey: true
      }),
    default: () => Promise.reject(new Error("Unsupported platform"))
  })();

const getIntegrityContext = (hardwareKeyTag: string): IntegrityContext => ({
  getHardwareKeyTag: () => hardwareKeyTag,
  getAttestation: (nonce: string) => getAttestation(nonce, hardwareKeyTag),
  getHardwareSignatureWithAuthData: clientData =>
    getHardwareSignatureWithAuthData(hardwareKeyTag, clientData)
});

export {
  ensureIntegrityServiceIsReady,
  generateIntegrityHardwareKeyTag,
  getIntegrityContext
};
