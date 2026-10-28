jest.mock("expo-modules-core", () => ({
  requireNativeModule: jest.fn(() => ({
    isAttestationServiceAvailable: jest.fn(),
    generateHardwareKey: jest.fn(),
    getAttestation: jest.fn(),
    generateHardwareSignatureWithAssertion: jest.fn(),
    decodeAssertion: jest.fn(),
    isPlayServicesAvailable: jest.fn(),
    prepareIntegrityToken: jest.fn(),
    requestIntegrityToken: jest.fn()
  }))
}));
jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return "ios";
    }
  }
}));

import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

import * as Integrity from "../index";

const nativeModule = jest.mocked(
  jest.mocked(requireNativeModule).mock.results[0].value
) as {
  [Method in keyof typeof Integrity]: jest.Mock;
};
const mockPlatform = jest.spyOn(Platform, "OS", "get");

const operations = [
  {
    name: "isAttestationServiceAvailable",
    platforms: ["ios"],
    args: [],
    result: true
  },
  { name: "generateHardwareKey", platforms: ["ios"], args: [], result: "key" },
  {
    name: "getAttestation",
    platforms: ["ios", "android"],
    args: ["challenge", "key"],
    result: "attestation"
  },
  {
    name: "generateHardwareSignatureWithAssertion",
    platforms: ["ios"],
    args: ["data", "key"],
    result: "assertion"
  },
  {
    name: "decodeAssertion",
    platforms: ["ios"],
    args: ["assertion"],
    result: { signature: "signature", authenticatorData: "data" }
  },
  {
    name: "isPlayServicesAvailable",
    platforms: ["android"],
    args: [],
    result: true
  },
  {
    name: "prepareIntegrityToken",
    platforms: ["android"],
    args: ["123"],
    result: undefined
  },
  {
    name: "requestIntegrityToken",
    platforms: ["android"],
    args: ["hash"],
    result: "token"
  }
] as const;

beforeEach(() => {
  Object.values(nativeModule).forEach(method => method.mockReset());
  mockPlatform.mockReturnValue("ios");
});

test("loads the Expo native module", () => {
  expect(requireNativeModule).toHaveBeenCalledWith("ExpoIntegrity");
});

describe.each(["ios", "android", "web"] as const)("%s", platform => {
  beforeEach(() => {
    mockPlatform.mockReturnValue(platform);
  });

  test.each(operations)(
    "$name preserves the platform contract",
    async ({ name, platforms, args, result }) => {
      const operation = Integrity[name] as (
        ...parameters: ReadonlyArray<string>
      ) => Promise<unknown>;
      if ((platforms as ReadonlyArray<string>).includes(platform)) {
        nativeModule[name].mockResolvedValueOnce(result);
        await expect(operation(...args)).resolves.toEqual(result);
        expect(nativeModule[name]).toHaveBeenCalledWith(...args);
      } else {
        await expect(operation(...args)).rejects.toEqual({
          message: "PLATFORM_NOT_SUPPORTED",
          userInfo: {}
        });
        expect(nativeModule[name]).not.toHaveBeenCalled();
      }
    }
  );
});

test("passes a missing request hash as null to Expo", async () => {
  mockPlatform.mockReturnValue("android");
  await Integrity.requestIntegrityToken();
  expect(nativeModule.requestIntegrityToken).toHaveBeenCalledWith(null);
});

test.each([
  {
    name: "native details",
    error: { code: "ATTESTATION_ERROR", message: "Service unavailable" },
    expected: {
      message: "ATTESTATION_ERROR",
      userInfo: { error: "Service unavailable" }
    }
  },
  {
    name: "no details",
    error: { code: "UNSUPPORTED_SERVICE", message: "UNSUPPORTED_SERVICE" },
    expected: { message: "UNSUPPORTED_SERVICE", userInfo: {} }
  },
  {
    name: "existing userInfo",
    error: { code: "ATTESTATION_ERROR", userInfo: { error: "details" } },
    expected: { message: "ATTESTATION_ERROR", userInfo: { error: "details" } }
  }
])(
  "preserves the legacy error shape with $name",
  async ({ error, expected }) => {
    mockPlatform.mockReturnValue("ios");
    nativeModule.getAttestation.mockRejectedValueOnce(error);
    await expect(Integrity.getAttestation("challenge", "key")).rejects.toEqual(
      expected
    );
  }
);

test("does not replace unexpected errors", async () => {
  const error = new Error("unexpected");
  nativeModule.getAttestation.mockRejectedValueOnce(error);
  await expect(Integrity.getAttestation("challenge", "key")).rejects.toBe(
    error
  );
});
