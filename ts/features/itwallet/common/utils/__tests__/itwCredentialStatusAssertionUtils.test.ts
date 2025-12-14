import { shouldRequestStatusAssertion } from "../itwCredentialStatusAssertionUtils";
import { CredentialType, ItwStatusAssertionMocks } from "../itwMocksUtils";
import { StoredCredential } from "../itwTypesUtils";

describe("shouldRequestStatusAssertion", () => {
  const baseMockCredential: StoredCredential = {
    credential: "",
    credentialType: CredentialType.DRIVING_LICENSE,
    credentialId: "dc_sd_jwt_mDL",
    format: "dc+sd-jwt",
    keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
    issuerConf: {} as StoredCredential["issuerConf"],
    parsedCredential: {},
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: "2025-09-30T07:32:50.000Z"
    }
  };

  it("return true when the status assertion is missing", () => {
    expect(shouldRequestStatusAssertion(baseMockCredential)).toEqual(true);
  });

  it("return true when the parsed status assertion is null", () => {
    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAssertion: {
        credentialStatus: "unknown"
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });

  it("return true when the status assertion is expired", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAssertion: {
        credentialStatus: "valid",
        statusAssertion: "abc",
        parsedStatusAssertion: {
          ...ItwStatusAssertionMocks.mdl,
          exp: 1724752800 // 2024-08-27T10:00:00+00:00
        }
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });

  it("return false when the status assertion is still valid", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAssertion: {
        credentialStatus: "valid",
        statusAssertion: "abc",
        parsedStatusAssertion: {
          ...ItwStatusAssertionMocks.mdl,
          exp: 1724781600 // 2024-08-27T18:00:00+00:00,
        }
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(false);
  });

  it("return true when the credential status is invalid", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAssertion: {
        credentialStatus: "invalid"
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });

  it("return true when the credential status is unknown", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));

    const mockCredential: StoredCredential = {
      ...baseMockCredential,
      storedStatusAssertion: {
        credentialStatus: "unknown"
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });
});
