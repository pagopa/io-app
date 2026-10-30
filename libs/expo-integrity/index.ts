import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export type DecodedAttestation = {
  authenticatorData: string;
  signature: string;
};

export type IntegrityError = {
  message: IntegrityErrorCodes;
  userInfo: Record<string, string>;
};

export type IntegrityErrorCodes =
  | "ATTESTATION_ERROR"
  | "CHALLANGE_ERROR"
  | "CLIENT_DATA_ENCODING_ERROR"
  | "DECODING_ASSERTION_FAILED"
  | "GENERATION_ASSERTION_FAILED"
  | "GENERATION_KEY_FAILED"
  | "KEY_ALREADY_EXISTS"
  | "KEY_IS_NOT_HARDWARE_BACKED"
  | "KEYSTORE_NOT_INITIALIZED"
  | "PLATFORM_NOT_SUPPORTED"
  | "PREPARE_FAILED"
  | "PREPARE_NOT_CALLED"
  | "PREPARE_TOKEN_EXCEPTION"
  | "REQUEST_ATTESTATION_FAILED"
  | "REQUEST_TOKEN_FAILED"
  | "UNSUPPORTED_DEVICE"
  | "UNSUPPORTED_IOS_VERSION"
  | "UNSUPPORTED_SERVICE"
  | "WRONG_GOOGLE_CLOUD_PROJECT_NUMBER_FORMAT";

interface IntegrityModuleType {
  decodeAssertion(assertion: string): Promise<DecodedAttestation>;
  generateHardwareKey(): Promise<string>;
  generateHardwareSignatureWithAssertion(
    clientData: string,
    hardwareKeyTag: string
  ): Promise<string>;
  getAttestation(challenge: string, hardwareKeyTag: string): Promise<string>;
  isAttestationServiceAvailable(): Promise<boolean>;
  isPlayServicesAvailable(): Promise<boolean>;
  prepareIntegrityToken(cloudProjectNumber: string): Promise<void>;
  requestIntegrityToken(requestHash: null | string): Promise<string>;
}

const IntegrityModule =
  requireNativeModule<IntegrityModuleType>("ExpoIntegrity");

async function invoke<Result>(
  platforms: ReadonlyArray<string>,
  operation: () => Promise<Result>
): Promise<Result> {
  if (!platforms.includes(Platform.OS)) {
    return Promise.reject({
      message: "PLATFORM_NOT_SUPPORTED",
      userInfo: {}
    } satisfies IntegrityError);
  }
  try {
    return await operation();
  } catch (error) {
    const nativeError = error as null | {
      code?: IntegrityErrorCodes;
      message?: string;
      userInfo?: Record<string, string>;
    };
    if (!nativeError?.code) {
      throw error;
    }
    return Promise.reject({
      message: nativeError.code,
      userInfo:
        nativeError.userInfo ??
        (nativeError.message && nativeError.message !== nativeError.code
          ? { error: nativeError.message }
          : {})
    } satisfies IntegrityError);
  }
}

export const isAttestationServiceAvailable = (): Promise<boolean> =>
  invoke(["ios"], () => IntegrityModule.isAttestationServiceAvailable());

export const generateHardwareKey = (): Promise<string> =>
  invoke(["ios"], () => IntegrityModule.generateHardwareKey());

export const getAttestation = (
  challenge: string,
  hardwareKeyTag: string
): Promise<string> =>
  invoke(["ios", "android"], () =>
    IntegrityModule.getAttestation(challenge, hardwareKeyTag)
  );

export const generateHardwareSignatureWithAssertion = (
  clientData: string,
  hardwareKeyTag: string
): Promise<string> =>
  invoke(["ios"], () =>
    IntegrityModule.generateHardwareSignatureWithAssertion(
      clientData,
      hardwareKeyTag
    )
  );

export const decodeAssertion = (
  assertion: string
): Promise<DecodedAttestation> =>
  invoke(["ios"], () => IntegrityModule.decodeAssertion(assertion));

export const isPlayServicesAvailable = (): Promise<boolean> =>
  invoke(["android"], () => IntegrityModule.isPlayServicesAvailable());

export const prepareIntegrityToken = (
  cloudProjectNumber: string
): Promise<void> =>
  invoke(["android"], () =>
    IntegrityModule.prepareIntegrityToken(cloudProjectNumber)
  );

export const requestIntegrityToken = (requestHash?: string): Promise<string> =>
  invoke(["android"], () =>
    IntegrityModule.requestIntegrityToken(requestHash ?? null)
  );
