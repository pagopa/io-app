import { shouldRequestStatusAttestation } from "../itwCredentialStatusAttestationUtils";
import { CredentialType, ItwStatusAttestationMocks } from "../itwMocksUtils";
import { StoredCredential } from "../itwTypesUtils";

describe("isStatusAttestationMissingOrExpired", () => {
  const baseMockCredential: StoredCredential = {
    credential: "",
    credentialType: CredentialType.DRIVING_LICENSE,
    format: "vc+sd-jwt",
    keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
    issuerConf: {} as StoredCredential["issuerConf"],
    parsedCredential: {}
  };

  it("return true when the status attestation is missing", () => {
    expect(shouldRequestStatusAttestation(baseMockCredential)).toEqual(true);
  });

  it("return true when the parsed status attestation is null", () => {
    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAttestation: {
        credentialStatus: "unknown"
      }
    };
    expect(shouldRequestStatusAttestation(mockCredential)).toEqual(true);
  });

  it("return true when the status attestation is expired", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation: "abc",
        parsedStatusAttestation: {
          ...ItwStatusAttestationMocks.mdl,
          exp: 1724752800 // 2024-08-27T10:00:00+00:00
        }
      }
    };
    expect(shouldRequestStatusAttestation(mockCredential)).toEqual(true);
  });

  it("return false when the status attestation is still valid", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation: "abc",
        parsedStatusAttestation: {
          ...ItwStatusAttestationMocks.mdl,
          exp: 1724781600 // 2024-08-27T18:00:00+00:00,
        }
      }
    };
    expect(shouldRequestStatusAttestation(mockCredential)).toEqual(false);
  });

  it("return false when the credential status is invalid", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAttestation: {
        credentialStatus: "invalid"
      }
    };
    expect(shouldRequestStatusAttestation(mockCredential)).toEqual(false);
  });

  it("return true when the credential status is unknown", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAttestation: {
        credentialStatus: "unknown"
      }
    };
    expect(shouldRequestStatusAttestation(mockCredential)).toEqual(true);
  });
});
