import type { VerifierRequest } from "../types";

import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import { UntrustedRpError } from "../errors";
import {
  generateAcceptedFields,
  getProximityDetails,
  getVerifierIdentity
} from "../presentation";

const mockDocType = "org.iso.18013.5.1.mDL";
const mockCommonName = "EUDI Proximity Verifier";
const mockCertificateData = {
  commonName: mockCommonName
} as VerifierRequest["request"][string]["certificateData"];
const mockCredential: CredentialMetadata = {
  credentialType: "MDL",
  credentialId: "mso_mdoc_mDL",
  format: "mso_mdoc",
  keyTag: "ee1576b6-f5ba-4f49-94c4-507e62786ebc",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  parsedCredential: {
    "org.iso.18013.5.1.aamva:family_name": {
      name: { "en-US": "Family name", "it-IT": "Cognome" },
      value: "ROSSI"
    },
    "org.iso.18013.5.1:tax_id_code": {
      name: { "en-US": "Tax Id number", "it-IT": "Codice Fiscale" },
      value: 1000
    }
  },
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  },
  spec_version: "1.0.0"
};

const mockCredentials: Record<string, CredentialMetadata> = {
  [mockDocType]: mockCredential
};

describe("getVerifierIdentity", () => {
  describe("when requireAuthenticated is falsy (unauthenticated allowed)", () => {
    test.each([
      {
        name: "undefined requireAuthenticated + commonName present",
        certificateData: {
          commonName: mockCommonName
        } as VerifierRequest["request"][string]["certificateData"],
        requireAuthenticated: undefined as boolean | undefined,
        expected: mockCommonName
      },
      {
        name: "false requireAuthenticated + commonName present",
        certificateData: {
          commonName: mockCommonName
        } as VerifierRequest["request"][string]["certificateData"],
        requireAuthenticated: false,
        expected: mockCommonName
      },
      {
        name: "undefined requireAuthenticated + no commonName",
        certificateData:
          {} as VerifierRequest["request"][string]["certificateData"],
        requireAuthenticated: undefined as boolean | undefined,
        expected: "Unknown"
      },
      {
        name: "false requireAuthenticated + no commonName",
        certificateData:
          {} as VerifierRequest["request"][string]["certificateData"],
        requireAuthenticated: false,
        expected: "Unknown"
      },
      {
        name: "undefined requireAuthenticated + certificateData undefined",
        certificateData: undefined,
        requireAuthenticated: undefined as boolean | undefined,
        expected: "Unknown"
      },
      {
        name: "false requireAuthenticated + certificateData undefined",
        certificateData: undefined,
        requireAuthenticated: false,
        expected: "Unknown"
      }
    ])(
      "returns $expected — $name",
      ({ certificateData, requireAuthenticated, expected }) => {
        expect(getVerifierIdentity(certificateData, requireAuthenticated)).toBe(
          expected
        );
      }
    );
  });

  describe("when requireAuthenticated is true", () => {
    it("returns commonName when certificateData has it", () => {
      const result = getVerifierIdentity(
        {
          commonName: mockCommonName
        } as VerifierRequest["request"][string]["certificateData"],
        true
      );
      expect(result).toBe(mockCommonName);
    });

    test.each([
      {
        name: "certificateData has no commonName",
        certificateData:
          {} as VerifierRequest["request"][string]["certificateData"]
      },
      {
        name: "certificateData is undefined",
        certificateData: undefined
      }
    ])("throws UntrustedRpError — $name", ({ certificateData }) => {
      expect(() => getVerifierIdentity(certificateData, true)).toThrow(
        UntrustedRpError
      );
    });

    it("throws with correct message when commonName missing", () => {
      expect(() => getVerifierIdentity(undefined, true)).toThrow(
        "Missing certificate data for RP identification"
      );
    });
  });
});

describe("getProximityDetails", () => {
  describe("authentication enforcement", () => {
    const unauthenticatedRequest = {
      request: {
        [mockDocType]: {
          "org.iso.18013.5.1.aamva": { family_name: false },
          isAuthenticated: false
        }
      }
    } as unknown as VerifierRequest;

    it("throws UntrustedRpError for unauthenticated RP by default", () => {
      expect(() =>
        getProximityDetails({
          request: unauthenticatedRequest.request,
          credentials: mockCredentials
        })
      ).toThrow(UntrustedRpError);
    });

    it("throws UntrustedRpError for unauthenticated RP when requireAuthenticated = true", () => {
      expect(() =>
        getProximityDetails({
          request: unauthenticatedRequest.request,
          credentials: mockCredentials,
          requireAuthenticated: true
        })
      ).toThrow(UntrustedRpError);
    });

    it("does NOT throw for unauthenticated RP when requireAuthenticated = false", () => {
      expect(() =>
        getProximityDetails({
          request: unauthenticatedRequest.request,
          credentials: mockCredentials,
          requireAuthenticated: false
        })
      ).not.toThrow();
    });

    it("returns details for unauthenticated RP when requireAuthenticated = false", () => {
      const result = getProximityDetails({
        request: unauthenticatedRequest.request,
        credentials: mockCredentials,
        requireAuthenticated: false
      });

      expect(result).toHaveLength(1);
      expect(result[0].credentialType).toBe(mockCredential.credentialType);
    });

    it("throws when any doc type in request has unauthenticated RP (default)", () => {
      const mixedRequest = {
        request: {
          [mockDocType]: {
            "org.iso.18013.5.1.aamva": { family_name: false },
            isAuthenticated: true,
            certificateData: mockCertificateData
          },
          unknown_credential: {
            "org.iso.18013.5.1": { unknown_field: true },
            isAuthenticated: false
          }
        }
      } as unknown as VerifierRequest;

      expect(() =>
        getProximityDetails({
          request: mixedRequest.request,
          credentials: mockCredentials
        })
      ).toThrow(UntrustedRpError);
    });
  });

  describe("certificate commonName enforcement", () => {
    const buildRequest = (
      certificateData?: VerifierRequest["request"][string]["certificateData"]
    ) =>
      ({
        request: {
          [mockDocType]: {
            "org.iso.18013.5.1.aamva": { family_name: false },
            isAuthenticated: true,
            ...(certificateData ? { certificateData } : {})
          }
        }
      }) as unknown as VerifierRequest;

    it("throws UntrustedRpError when commonName is missing (default)", () => {
      expect(() =>
        getProximityDetails({
          request: buildRequest().request,
          credentials: mockCredentials
        })
      ).toThrow(UntrustedRpError);
    });

    it("throws UntrustedRpError when commonName is missing and requireAuthenticated = true", () => {
      expect(() =>
        getProximityDetails({
          request: buildRequest().request,
          credentials: mockCredentials,
          requireAuthenticated: true
        })
      ).toThrow(UntrustedRpError);
    });

    it("does NOT throw when commonName is provided (default)", () => {
      expect(() =>
        getProximityDetails({
          request: buildRequest(mockCertificateData).request,
          credentials: mockCredentials
        })
      ).not.toThrow();
    });

    it("sets rpId from the certificate commonName", () => {
      const result = getProximityDetails({
        request: buildRequest(mockCertificateData).request,
        credentials: mockCredentials
      });

      expect(result[0].rpId).toBe(mockCommonName);
    });

    it("does NOT throw when commonName is missing but requireAuthenticated = false", () => {
      expect(() =>
        getProximityDetails({
          request: buildRequest().request,
          credentials: mockCredentials,
          requireAuthenticated: false
        })
      ).not.toThrow();
    });
  });

  it("throws if credential is not found for requested docType", () => {
    const parsedRequest = {
      request: {
        unknown_credential: {
          "org.iso.18013.5.1": { unknown_field: true },
          isAuthenticated: true,
          certificateData: mockCertificateData
        }
      }
    } as unknown as VerifierRequest;

    expect(() =>
      getProximityDetails({
        request: parsedRequest.request,
        credentials: {}
      })
    ).toThrow();
  });

  it("returns parsed claims for a valid authenticated request", () => {
    const parsedRequest = {
      request: {
        [mockDocType]: {
          "org.iso.18013.5.1.aamva": { family_name: false },
          "org.iso.18013.5.1": { tax_id_code: false },
          isAuthenticated: true,
          certificateData: mockCertificateData
        }
      }
    } as unknown as VerifierRequest;

    const result = getProximityDetails({
      request: parsedRequest.request,
      credentials: mockCredentials
    });

    expect(result).toEqual([
      {
        rpId: mockCommonName,
        claimsToDisplay: [
          {
            id: "org.iso.18013.5.1.aamva:family_name",
            label: "Cognome",
            value: "ROSSI"
          },
          {
            id: "org.iso.18013.5.1:tax_id_code",
            label: "Codice Fiscale",
            value: 1000
          }
        ],
        credentialType: mockCredential.credentialType
      }
    ]);
  });

  it("only includes requested fields in claimsToDisplay", () => {
    const parsedRequest = {
      request: {
        [mockDocType]: {
          "org.iso.18013.5.1.aamva": { family_name: false },
          isAuthenticated: true,
          certificateData: mockCertificateData
        }
      }
    } as unknown as VerifierRequest;

    const result = getProximityDetails({
      request: parsedRequest.request,
      credentials: mockCredentials
    });

    expect(result[0].claimsToDisplay).toHaveLength(1);
    expect(result[0].claimsToDisplay[0].id).toBe(
      "org.iso.18013.5.1.aamva:family_name"
    );
  });

  it("excludes WIA doc type from result", () => {
    const WIA_DOC_TYPE = "org.iso.18013.5.1.IT.WalletAttestation";
    const requestWithWia = {
      request: {
        [mockDocType]: {
          "org.iso.18013.5.1.aamva": { family_name: false },
          isAuthenticated: true,
          certificateData: mockCertificateData
        },
        [WIA_DOC_TYPE]: {
          "org.iso.18013.5.1": { some_field: true },
          isAuthenticated: true,
          certificateData: mockCertificateData
        }
      }
    } as unknown as VerifierRequest;

    const result = getProximityDetails({
      request: requestWithWia.request,
      credentials: mockCredentials
    });

    expect(result).toHaveLength(1);
    expect(result[0].credentialType).toBe(mockCredential.credentialType);
  });
});

describe("generateAcceptedFields", () => {
  it("should return an object with all fields set to true", () => {
    const parsedRequest: VerifierRequest = {
      request: {
        credential_A: {
          "org.iso.18013.5.1.aamva": { family_name: false },
          "org.iso.18013.5.1": { unknown_field: false, tax_id_code: false },
          isAuthenticated: true
        },
        credential_B: {
          "org.iso.18013.5.1.aamva": { family_name: true },
          "org.iso.18013.5.1": { unknown_field: false, tax_id_code: false },
          isAuthenticated: true
        }
      }
    } as unknown as VerifierRequest;

    const acceptedFields = generateAcceptedFields(parsedRequest.request);

    expect(acceptedFields).toEqual({
      credential_A: {
        "org.iso.18013.5.1.aamva": { family_name: true },
        "org.iso.18013.5.1": { unknown_field: true, tax_id_code: true }
      },
      credential_B: {
        "org.iso.18013.5.1.aamva": { family_name: true },
        "org.iso.18013.5.1": { unknown_field: true, tax_id_code: true }
      }
    });
  });
});
