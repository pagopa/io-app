import {
  createClientAttestationPopJwt,
  createPushedAuthorizationRequest,
  fetchPushedAuthorizationResponse
} from "@pagopa/io-wallet-oauth2";

jest.mock("@pagopa/io-wallet-oauth2", () => ({
  createClientAttestationPopJwt: jest.fn(),
  createPushedAuthorizationRequest: jest.fn(),
  fetchPushedAuthorizationResponse: jest.fn()
}));

const { startUserAuthorization } = jest.requireActual(
  "@pagopa/io-react-native-wallet/lib/commonjs/credential/issuance/v1.3.3/02-start-user-authorization"
);

const CREDENTIAL_CONFIGURATION_ID = "UniversityDegree";
const ISSUER_STATE = "issuer-session-id";
const OFFER_SCOPE = "university_degree";

const issuerConf = {
  authorization_endpoint: "https://as.example.it/authorize",
  credential_configurations_supported: {
    [CREDENTIAL_CONFIGURATION_ID]: {
      format: "dc+sd-jwt",
      scope: OFFER_SCOPE
    }
  },
  credential_issuer: "https://issuer.example.it",
  pushed_authorization_request_endpoint: "https://as.example.it/par",
  response_modes_supported: ["form_post.jwt"]
};

describe("io-react-native-wallet startUserAuthorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (createPushedAuthorizationRequest as jest.Mock).mockResolvedValue({
      pkceCodeVerifier: "code-verifier"
    });
    (createClientAttestationPopJwt as jest.Mock).mockResolvedValue(
      "client-attestation-pop"
    );
    (fetchPushedAuthorizationResponse as jest.Mock).mockResolvedValue({
      request_uri: "request-uri"
    });
  });

  it("sends scope and issuer_state instead of authorization_details for credential offer authorization", async () => {
    await startUserAuthorization(
      issuerConf,
      [CREDENTIAL_CONFIGURATION_ID],
      { proofType: "none" },
      {
        credentialOfferGrant: {
          issuerState: ISSUER_STATE,
          scope: OFFER_SCOPE
        },
        redirectUri: "ioit://issuance",
        walletInstanceAttestation: "wia-jwt",
        wiaCryptoContext: {
          getPublicKey: jest.fn().mockResolvedValue({ kid: "client-id" })
        }
      }
    );

    expect(createPushedAuthorizationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        authorization_details: undefined,
        issuerState: ISSUER_STATE,
        scope: OFFER_SCOPE
      })
    );
  });
});
