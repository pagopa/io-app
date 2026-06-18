import { generate } from "@pagopa/io-react-native-crypto";
import { createCryptoContextFor } from "@pagopa/io-react-native-wallet";
import {
  generateKeysWithWalletUnitAttestation,
  requestCredential
} from "../itwCredentialIssuanceUtils";
import {
  CredentialAccessToken,
  CredentialOfferResolved,
  CredentialFormat,
  IssuerConfiguration
} from "../itwTypesUtils";
import { Env } from "../environment";
import { getWalletUnitAttestation } from "../itwAttestationUtils";
import { getIoWallet } from "../itwIoWallet";

jest.mock("@pagopa/io-react-native-crypto", () => ({ generate: jest.fn() }));
jest.mock("@pagopa/io-react-native-wallet", () => ({
  createCryptoContextFor: jest.fn(),
  Errors: {
    IssuerResponseErrorCodes: {
      CredentialInvalidStatus: "CredentialInvalidStatus"
    },
    isIssuerResponseError: jest.fn()
  },
  Trust: {
    Errors: {
      FederationError: class FederationError extends Error {}
    }
  }
}));
jest.mock("../itwAttestationUtils", () => ({
  getWalletUnitAttestation: jest.fn()
}));
jest.mock("../itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

describe("generateKeysWithWalletUnitAttestation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAccessToken: CredentialAccessToken = {
    access_token: "",
    authorization_details: [
      {
        type: "openid_credential",
        credential_configuration_id: "credential-config-id",
        credential_identifiers: ["credential-id-1"]
      }
    ],
    token_type: "DPoP"
  };

  it("should generate a wallet unit attestation when supported, skipping direct key generation", async () => {
    (getIoWallet as jest.Mock).mockReturnValue({
      WalletUnitAttestation: { isSupported: true }
    });
    (getWalletUnitAttestation as jest.Mock).mockImplementation(() => "wua-jwt");

    const result = await generateKeysWithWalletUnitAttestation(
      mockAccessToken,
      {
        env: {} as Env,
        itwVersion: "1.3.3",
        hardwareKeyTag: "hardware-key",
        sessionToken: "session-token"
      }
    );
    expect(generate).not.toHaveBeenCalled();
    expect(getWalletUnitAttestation).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        keyTag: expect.any(String),
        authDetails: {
          type: "openid_credential",
          credential_configuration_id: "credential-config-id",
          credential_identifiers: ["credential-id-1"]
        },
        walletUnitAttestation: "wua-jwt",
        walletUnitAttestationId: expect.any(String)
      }
    ]);
  });

  it("should only generate keys when the wallet unit attestation is not supported", async () => {
    (getIoWallet as jest.Mock).mockReturnValue({
      WalletUnitAttestation: { isSupported: false }
    });

    const result = await generateKeysWithWalletUnitAttestation(
      mockAccessToken,
      {
        env: {} as Env,
        itwVersion: "1.0.0",
        hardwareKeyTag: "hardware-key",
        sessionToken: "session-token"
      }
    );
    expect(generate).toHaveBeenCalledTimes(1);
    expect(getWalletUnitAttestation).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        keyTag: expect.any(String),
        authDetails: {
          type: "openid_credential",
          credential_configuration_id: "credential-config-id",
          credential_identifiers: ["credential-id-1"]
        }
      }
    ]);
  });
});

describe("requestCredential", () => {
  const mockWiaCryptoContext = { tag: "wia-crypto-context" };
  const mockRequestObject = { request_uri: "request-uri" };
  const evaluateIssuerTrust = jest.fn();
  const startUserAuthorization = jest.fn();
  const getRequestedCredentialToBePresented = jest.fn();

  const env = {
    WALLET_EAA_PROVIDER_BASE_URL: {
      value: jest.fn(() => "https://catalogue-issuer.example.com")
    },
    ISSUANCE_REDIRECT_URI: "ioit://issuance"
  } as unknown as Env;

  const issuerConf = {
    credential_issuer: "https://issuer.example.com",
    pushed_authorization_request_endpoint: "https://auth.example.com/par",
    authorization_endpoint: "https://auth.example.com/authorize",
    token_endpoint: "https://auth.example.com/token",
    nonce_endpoint: "https://issuer.example.com/nonce",
    credential_endpoint: "https://issuer.example.com/credential",
    status_assertion_endpoint: "https://issuer.example.com/status",
    keys: [],
    credential_configurations_supported: {
      "dc-sd-jwt": {
        format: CredentialFormat.SD_JWT,
        scope: "offer-scope",
        vct: "https://issuer.example.com/vct",
        display: [],
        claims: []
      },
      "mso-mdoc": {
        format: CredentialFormat.MDOC,
        scope: "offer-scope",
        doctype: "org.iso.18013.5.1.mDL",
        display: [],
        claims: []
      }
    },
    federation_entity: {}
  } satisfies IssuerConfiguration;

  const credentialOffer = {
    credential_issuer: "https://issuer.example.com",
    credential_configuration_ids: ["dc-sd-jwt", "mso-mdoc"],
    grants: {
      authorization_code: {
        authorization_server: "https://auth.example.com",
        issuer_state: "issuer-state",
        scope: "offer-scope"
      }
    }
  } satisfies CredentialOfferResolved["offer"];

  beforeEach(() => {
    jest.clearAllMocks();
    (createCryptoContextFor as jest.Mock).mockReturnValue(mockWiaCryptoContext);
    evaluateIssuerTrust.mockResolvedValue({ issuerConf });
    startUserAuthorization.mockResolvedValue({
      issuerRequestUri: "issuer-request-uri",
      clientId: "client-id",
      codeVerifier: "code-verifier",
      responseMode: "query"
    });
    getRequestedCredentialToBePresented.mockResolvedValue(mockRequestObject);
    (getIoWallet as jest.Mock).mockReturnValue({
      CredentialIssuance: {
        evaluateIssuerTrust,
        startUserAuthorization,
        getRequestedCredentialToBePresented
      }
    });
  });

  it("uses credential offer issuer and requests the supported credential configurations from the offer", async () => {
    await requestCredential({
      env,
      itwVersion: "1.3.3",
      credentialType: "ignored-catalogue-scope",
      walletInstanceAttestation: "wallet-instance-attestation",
      skipMdocIssuance: true,
      credentialOffer: {
        offer: credentialOffer,
        grantDetails: {
          grantType: "authorization_code",
          authorizationCodeGrant: {
            scope: "offer-scope",
            issuerState: "issuer-state",
            authorizationServer: "https://auth.example.com"
          }
        }
      }
    });

    expect(evaluateIssuerTrust).toHaveBeenCalledWith(
      "https://issuer.example.com"
    );
    expect(evaluateIssuerTrust.mock.invocationCallOrder[0]).toBeLessThan(
      startUserAuthorization.mock.invocationCallOrder[0]
    );
    expect(startUserAuthorization).toHaveBeenCalledWith(
      issuerConf,
      ["dc-sd-jwt"],
      { proofType: "none" },
      expect.objectContaining({
        walletInstanceAttestation: "wallet-instance-attestation",
        redirectUri: "ioit://issuance",
        wiaCryptoContext: mockWiaCryptoContext
      })
    );
    expect(startUserAuthorization.mock.calls[0][3]).not.toHaveProperty("scope");
    expect(startUserAuthorization.mock.calls[0][3]).not.toHaveProperty(
      "issuerState"
    );
  });

  it("keeps catalogue issuance unchanged", async () => {
    await requestCredential({
      env,
      itwVersion: "1.3.3",
      credentialType: "offer-scope",
      walletInstanceAttestation: "wallet-instance-attestation",
      skipMdocIssuance: true
    });

    expect(evaluateIssuerTrust).toHaveBeenCalledWith(
      "https://catalogue-issuer.example.com"
    );
    expect(startUserAuthorization).toHaveBeenCalledWith(
      issuerConf,
      ["dc-sd-jwt"],
      { proofType: "none" },
      expect.not.objectContaining({
        scope: expect.anything(),
        issuerState: expect.anything()
      })
    );
  });
});
