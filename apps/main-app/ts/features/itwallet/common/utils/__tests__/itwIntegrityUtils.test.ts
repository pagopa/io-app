import { sign } from "@pagopa/io-react-native-crypto";
import {
  getAttestation,
  getAttestationAssertion,
  getHardwareAttestationCapabilities,
  prepareIntegrityToken,
  requestIntegrityToken
} from "@pagopa/io-react-native-integrity";
import { Platform } from "react-native";
import sha from "sha.js";

import { Env } from "../environment";
import {
  ensureIntegrityServiceIsReady,
  getIntegrityContext
} from "../itwIntegrityUtils";

jest.mock("@pagopa/io-react-native-integrity", () => ({
  decodeAssertion: jest.fn(),
  generateHardwareKey: jest.fn(),
  generateHardwareSignatureWithAssertion: jest.fn(),
  getAttestation: jest.fn(),
  getAttestationAssertion: jest.fn(),
  getHardwareAttestationCapabilities: jest.fn(),
  isAttestationServiceAvailable: jest.fn(),
  prepareIntegrityToken: jest.fn(),
  requestIntegrityToken: jest.fn()
}));

jest.mock("@pagopa/io-react-native-crypto", () => ({
  sign: jest.fn()
}));

const env = { GOOGLE_CLOUD_PROJECT_NUMBER: "123456" } as Env;
const hardwareKeyTag = "hardware-key-tag";
const clientData = JSON.stringify({ challenge: "challenge" });
const clientDataHash = sha("sha256").update(clientData).digest("hex");

const mockCapabilities = (
  isPlayServicesAvailable: boolean,
  isHardwareAttestationSupported: boolean,
  hasAttestKey = true
) =>
  jest.mocked(getHardwareAttestationCapabilities).mockResolvedValue({
    firstApiLevel: 33,
    hasAttestKey,
    hasStrongBox: true,
    isHardwareAttestationSupported,
    isPlayServicesAvailable,
    sdkInt: 36
  });

describe("itwIntegrityUtils on Android", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Platform, "select").mockImplementation(spec => spec.android);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("ensureIntegrityServiceIsReady", () => {
    test.each([
      {
        name: "Play Services available",
        playServices: true,
        hardwareAttestation: true,
        prepareFails: false,
        expected: true
      },
      {
        name: "hardware attestation only (e.g. GrapheneOS without Play Services)",
        playServices: false,
        hardwareAttestation: true,
        prepareFails: false,
        expected: true
      },
      {
        name: "Play Integrity preparation failing with hardware attestation",
        playServices: true,
        hardwareAttestation: true,
        prepareFails: true,
        expected: true
      },
      {
        name: "neither Play Services nor hardware attestation",
        playServices: false,
        hardwareAttestation: false,
        prepareFails: false,
        expected: false
      },
      {
        name: "hardware attestation without attest key (e.g. Android 8-11 without Play Services)",
        playServices: false,
        hardwareAttestation: true,
        attestKey: false,
        prepareFails: false,
        expected: false
      }
    ])(
      "should resolve to $expected with $name",
      async ({
        playServices,
        hardwareAttestation,
        attestKey = true,
        prepareFails,
        expected
      }) => {
        mockCapabilities(playServices, hardwareAttestation, attestKey);
        jest
          .mocked(prepareIntegrityToken)
          .mockImplementation(() =>
            prepareFails
              ? Promise.reject(new Error("PREPARE_FAILED"))
              : Promise.resolve()
          );

        await expect(ensureIntegrityServiceIsReady(env)).resolves.toBe(
          expected
        );
        expect(prepareIntegrityToken).toHaveBeenCalledTimes(
          playServices ? 1 : 0
        );
      }
    );

    test.each([
      {
        name: "without hardware attestation",
        hardwareAttestation: false,
        attestKey: true
      },
      {
        name: "without attest key",
        hardwareAttestation: true,
        attestKey: false
      }
    ])(
      "should reject when Play Integrity preparation fails $name",
      async ({ hardwareAttestation, attestKey }) => {
        mockCapabilities(true, hardwareAttestation, attestKey);
        jest
          .mocked(prepareIntegrityToken)
          .mockRejectedValue(new Error("PREPARE_FAILED"));

        await expect(ensureIntegrityServiceIsReady(env)).rejects.toThrow(
          "PREPARE_FAILED"
        );
      }
    );
  });

  describe("getIntegrityContext", () => {
    beforeEach(() => {
      mockCapabilities(true, true);
    });

    it("should generate the key attestation with an attest key", async () => {
      jest.mocked(getAttestation).mockResolvedValue("attestation");

      await getIntegrityContext(hardwareKeyTag).getAttestation("nonce");

      expect(getAttestation).toHaveBeenCalledWith("nonce", hardwareKeyTag, {
        useAttestKey: true
      });
    });

    test.each([
      {
        name: "both proofs",
        integrityToken: "token",
        keyAttestation: "key-attestation"
      },
      {
        name: "the key attestation only (Play Integrity not available)",
        integrityToken: undefined,
        keyAttestation: "key-attestation"
      },
      {
        name: "the Play Integrity token only",
        integrityToken: "token",
        keyAttestation: undefined
      }
    ])(
      "should return the signature with $name",
      async ({ integrityToken, keyAttestation }) => {
        jest.mocked(sign).mockResolvedValue("signature");
        jest
          .mocked(requestIntegrityToken)
          .mockImplementation(() =>
            integrityToken
              ? Promise.resolve(integrityToken)
              : Promise.reject(new Error("PREPARE_NOT_CALLED"))
          );
        jest
          .mocked(getAttestationAssertion)
          .mockImplementation(() =>
            keyAttestation
              ? Promise.resolve(keyAttestation)
              : Promise.reject(new Error("HARDWARE_ATTESTATION_NOT_SUPPORTED"))
          );

        const result =
          await getIntegrityContext(
            hardwareKeyTag
          ).getHardwareSignatureWithAuthData(clientData);

        expect(result).toEqual({
          authenticatorData: integrityToken,
          hardwareKeyAttestation: keyAttestation,
          signature: "signature"
        });
        expect(requestIntegrityToken).toHaveBeenCalledWith(clientDataHash);
        expect(getAttestationAssertion).toHaveBeenCalledWith(
          clientDataHash,
          hardwareKeyTag
        );
      }
    );

    it("should not request the key attestation without attest key", async () => {
      mockCapabilities(true, true, false);
      jest.mocked(sign).mockResolvedValue("signature");
      jest.mocked(requestIntegrityToken).mockResolvedValue("token");

      const result =
        await getIntegrityContext(
          hardwareKeyTag
        ).getHardwareSignatureWithAuthData(clientData);

      expect(result).toEqual({
        authenticatorData: "token",
        hardwareKeyAttestation: undefined,
        signature: "signature"
      });
      expect(getAttestationAssertion).not.toHaveBeenCalled();
    });

    it("should reject with the Play Integrity error without attest key", async () => {
      mockCapabilities(false, true, false);
      jest.mocked(sign).mockResolvedValue("signature");
      jest
        .mocked(requestIntegrityToken)
        .mockRejectedValue(new Error("REQUEST_TOKEN_FAILED"));

      await expect(
        getIntegrityContext(hardwareKeyTag).getHardwareSignatureWithAuthData(
          clientData
        )
      ).rejects.toThrow("REQUEST_TOKEN_FAILED");
      expect(getAttestationAssertion).not.toHaveBeenCalled();
    });

    it("should reject with the Play Integrity error when no proof is available", async () => {
      jest.mocked(sign).mockResolvedValue("signature");
      jest
        .mocked(requestIntegrityToken)
        .mockRejectedValue(new Error("REQUEST_TOKEN_FAILED"));
      jest
        .mocked(getAttestationAssertion)
        .mockRejectedValue(new Error("ATTESTATION_ASSERTION_FAILED"));

      await expect(
        getIntegrityContext(hardwareKeyTag).getHardwareSignatureWithAuthData(
          clientData
        )
      ).rejects.toThrow("REQUEST_TOKEN_FAILED");
    });
  });
});
