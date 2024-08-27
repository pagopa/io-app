import { isStatusAttestationMissingOrExpired } from "../itwCredentialStatusAttestationUtils";
import { CredentialType } from "../itwMocksUtils";
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
    expect(isStatusAttestationMissingOrExpired(baseMockCredential)).toEqual(
      true
    );
  });

  it("return true when the parsed status attestation is null", () => {
    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      statusAttestation: {
        credentialStatus: "unknown",
        parsedStatusAttestation: null
      }
    };
    expect(isStatusAttestationMissingOrExpired(mockCredential)).toEqual(true);
  });

  it("return true when the status attestation is expired", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      statusAttestation: {
        credentialStatus: "valid",
        parsedStatusAttestation: {
          exp: 1724664600 // 2024-08-26T09:30:00+00:00
        }
      }
    };
    expect(isStatusAttestationMissingOrExpired(mockCredential)).toEqual(true);
  });

  it("return false when the status attestation is still valid", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      statusAttestation: {
        credentialStatus: "valid",
        parsedStatusAttestation: {
          exp: 1724682600 // 2024-08-26T14:00:00+00:00
        }
      }
    };
    expect(isStatusAttestationMissingOrExpired(mockCredential)).toEqual(false);
  });
});
