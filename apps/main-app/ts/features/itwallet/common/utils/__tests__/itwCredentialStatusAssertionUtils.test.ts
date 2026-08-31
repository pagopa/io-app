import { shouldRequestStatusAssertion } from "../itwCredentialStatusAssertionUtils";
import { CredentialType, ItwStatusAssertionMocks } from "../itwMocksUtils";
import { CredentialMetadata } from "../itwTypesUtils";

describe("shouldRequestStatusAssertion", () => {
  const baseMockCredential: CredentialMetadata = {
    credentialType: CredentialType.DRIVING_LICENSE,
    credentialId: "dc_sd_jwt_mDL",
    format: "dc+sd-jwt",
    keyTag: "9020c6f8-01be-4236-9b6f-834af9dcbc63",
    issuerConf: {} as CredentialMetadata["issuerConf"],
    parsedCredential: {},
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: "2025-09-30T07:32:50.000Z"
    },
    spec_version: "1.0.0"
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2024-08-27T10:30:00+00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("return true when the status assertion is missing", () => {
    expect(shouldRequestStatusAssertion(baseMockCredential)).toEqual(true);
  });

  it("return true when the credential status is unknown", () => {
    const mockCredential: CredentialMetadata = {
      ...baseMockCredential,
      validity: {
        type: "status_assertion",
        status: "unknown"
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });

  it("return true when the status assertion is expired", () => {
    const mockCredential: CredentialMetadata = {
      ...baseMockCredential,
      validity: {
        type: "status_assertion",
        status: "valid",
        statusAssertion: {
          ...ItwStatusAssertionMocks.mdl,
          exp: 1724752800 // 2024-08-27T10:00:00+00:00
        }
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });

  it("return false when the status assertion is still valid", () => {
    const mockCredential: CredentialMetadata = {
      ...baseMockCredential,
      validity: {
        type: "status_assertion",
        status: "valid",
        statusAssertion: {
          ...ItwStatusAssertionMocks.mdl,
          exp: 1724781600 // 2024-08-27T18:00:00+00:00,
        }
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(false);
  });

  it("return true when the credential status is invalid", () => {
    const mockCredential: CredentialMetadata = {
      ...baseMockCredential,
      validity: {
        type: "status_assertion",
        status: "invalid"
      }
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(true);
  });

  it("return false when the jwt is expired", () => {
    jest.setSystemTime(new Date("2026-02-24T10:30:00+00:00"));

    expect(shouldRequestStatusAssertion(baseMockCredential)).toEqual(false);
  });

  it("return false when the credential metadata does not contain validity and it is a 1.3 credential", () => {
    const mockCredential: CredentialMetadata = {
      ...baseMockCredential,
      spec_version: "1.3.3"
    };
    expect(shouldRequestStatusAssertion(mockCredential)).toEqual(false);
  });
});
