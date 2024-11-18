import { generate, sign } from "@pagopa/io-react-native-crypto";
import {
  decodeAssertion,
  generateHardwareKey,
  generateHardwareSignatureWithAssertion,
  getAttestation as getAttestationIntegrity,
  isAttestationServiceAvailable,
  isPlayServicesAvailable,
  prepareIntegrityToken,
  requestIntegrityToken
} from "@pagopa/io-react-native-integrity";
import { IntegrityContext } from "@pagopa/io-react-native-wallet";
import { Platform } from "react-native";
import uuid from "react-native-uuid";
import sha from "sha.js";
import { addPadding, removePadding } from "@pagopa/io-react-native-jwt";
import { itwGoogleCloudProjectNumber } from "../../../../config";

/**
 * Type returned by the getHardwareSignatureWithAuthData function of {@link IntegrityContext}.
 * It contains the signature and the authenticator data.
 */
export type HardwareSignatureWithAuthData = {
  signature: string;
  authenticatorData: string;
};

/**
 * Generates the hardware signature with the authentication data. The implementation differs between iOS and Android.
 * This will later be used to verify the signature on the server side.
 * @param hardwareKeyTag - the hardware key tag to use for the signature.
 * @returns a function that takes the client data as string and returns a promise that resolves with the signature and the authenticator data or rejects with an error.
 */
const getHardwareSignatureWithAuthData = (
  hardwareKeyTag: string,
  clientData: string
): Promise<HardwareSignatureWithAuthData> =>
  Platform.select({
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
      const authenticatorData = await requestIntegrityToken(clientDataHash);
      return { signature, authenticatorData };
    },
    default: async () => Promise.reject(new Error("Unsupported platform"))
  })();

/**
 * Generates the hardware backed key for the current platform. iOS or Android are supported.
 * @returns a promise that resolves with the key tag as string or rejects with an error.
 */
const generateIntegrityHardwareKeyTag = () =>
  Platform.select({
    ios: async () => {
      const key = await generateHardwareKey();
      return removePadding(key);
    },
    android: async () => {
      const keyTag = uuid.v4().toString();
      await generate(keyTag);
      return keyTag;
    },
    default: () => Promise.reject(new Error("Unsupported platform"))
  })();

/**
 * Ensures the integrity service is ready on the device.
 * @returns a promise with resolves with a boolean value indicating whether the integrity service is available.
 */
const ensureIntegrityServiceIsReady = () =>
  Platform.select({
    ios: async () => await isAttestationServiceAvailable(),
    android: async () => {
      const res = await isPlayServicesAvailable();
      if (!res) {
        return false;
      }
      await prepareIntegrityToken(itwGoogleCloudProjectNumber);
      return true;
    },
    default: () => Promise.reject(new Error("Unsupported platform"))
  })();

/**
 * Ensures that the hardwareKeyTag as padding added before calling {@see getAttestationIntegrity}
 */
const getAttestation = (challenge: string, hardwareKeyTag: string) =>
  Platform.select({
    ios: () => getAttestationIntegrity(challenge, addPadding(hardwareKeyTag)),
    android: () => getAttestationIntegrity(challenge, hardwareKeyTag),
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
