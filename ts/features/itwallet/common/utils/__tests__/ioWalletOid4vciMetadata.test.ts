import {
  fetchMetadata,
  type MetadataResponseV1_3
} from "@pagopa/io-wallet-oid4vci";
import {
  IoWalletSdkConfig,
  ItWalletSpecsVersion
} from "@pagopa/io-wallet-utils";

const credentialIssuerUrl = "https://issuer.example.it";
const firstAuthorizationServer = "https://as1.example.it";
const selectedAuthorizationServer = "https://as2.example.it";

const sdkConfigV1_3 = new IoWalletSdkConfig({
  itWalletSpecsVersion: ItWalletSpecsVersion.V1_3
});

const makeAuthorizationServerMetadata = (issuer: string) => ({
  acr_values_supported: ["https://www.spid.gov.it/SpidL2"],
  authorization_endpoint: `${issuer}/authorize`,
  authorization_signing_alg_values_supported: ["ES256"],
  client_attestation_pop_signing_alg_values_supported: ["ES256"],
  client_attestation_signing_alg_values_supported: ["ES256"],
  client_registration_types_supported: ["automatic"],
  code_challenge_methods_supported: ["S256"],
  dpop_signing_alg_values_supported: ["ES256"],
  grant_types_supported: ["authorization_code"],
  issuer,
  jwks: { keys: [{ kid: "kid", kty: "EC" }] },
  pushed_authorization_request_endpoint: `${issuer}/par`,
  request_object_signing_alg_values_supported: ["ES256"],
  require_signed_request_object: true,
  response_types_supported: ["code"],
  scopes_supported: ["openid"],
  token_endpoint: `${issuer}/token`,
  token_endpoint_auth_methods_supported: ["attest_jwt_client_auth"],
  token_endpoint_auth_signing_alg_values_supported: ["ES256"]
});

const credentialIssuerMetadata = {
  authorization_servers: [
    firstAuthorizationServer,
    selectedAuthorizationServer
  ],
  credential_configurations_supported: {
    TestCredential: {
      authentic_sources: {
        dataset_id: "test-dataset",
        entity_id: "test-entity"
      },
      credential_metadata: {
        display: [{ locale: "it-IT", name: "Test credential" }]
      },
      credential_signing_alg_values_supported: ["ES256"],
      cryptographic_binding_methods_supported: ["jwk"],
      format: "dc+sd-jwt",
      proof_types_supported: {
        jwt: { proof_signing_alg_values_supported: ["ES256"] }
      },
      schema_id: "test-schema",
      scope: "test_scope",
      vct: "TestCredential"
    }
  },
  credential_endpoint: `${credentialIssuerUrl}/credential`,
  credential_issuer: credentialIssuerUrl,
  jwks: { keys: [{ kid: "kid", kty: "EC" }] },
  nonce_endpoint: `${credentialIssuerUrl}/nonce`,
  trust_frameworks_supported: ["it_wallet"]
};

const responseForJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: 200
  });

const createMetadataFetch = () =>
  jest.fn(async (url: RequestInfo | URL) => {
    const normalizedUrl = url.toString();

    switch (normalizedUrl) {
      case `${credentialIssuerUrl}/.well-known/openid-federation`:
        return new Response(undefined, { status: 404 });
      case `${credentialIssuerUrl}/.well-known/openid-credential-issuer`:
        return responseForJson(credentialIssuerMetadata);
      case `${firstAuthorizationServer}/.well-known/oauth-authorization-server`:
        return responseForJson(
          makeAuthorizationServerMetadata(firstAuthorizationServer)
        );
      case `${selectedAuthorizationServer}/.well-known/oauth-authorization-server`:
        return responseForJson(
          makeAuthorizationServerMetadata(selectedAuthorizationServer)
        );
      default:
        return new Response(undefined, { status: 404 });
    }
  });

describe("fetchMetadata authorization server selection", () => {
  it("uses the first issuer authorization server when no authorization server is provided", async () => {
    const appFetch = createMetadataFetch();

    const metadata = (await fetchMetadata({
      callbacks: { fetch: appFetch },
      config: sdkConfigV1_3,
      credentialIssuerUrl
    })) as MetadataResponseV1_3;

    expect(metadata.metadata.oauth_authorization_server?.issuer).toBe(
      firstAuthorizationServer
    );
  });

  it("uses the offer authorization server when it matches issuer metadata", async () => {
    const appFetch = createMetadataFetch();

    const metadata = (await fetchMetadata({
      authorizationServer: selectedAuthorizationServer,
      callbacks: { fetch: appFetch },
      config: sdkConfigV1_3,
      credentialIssuerUrl
    })) as MetadataResponseV1_3;

    expect(metadata.metadata.oauth_authorization_server?.issuer).toBe(
      selectedAuthorizationServer
    );
  });

  it("rejects an offer authorization server not listed by issuer metadata", async () => {
    await expect(
      fetchMetadata({
        authorizationServer: "https://unknown-as.example.it",
        callbacks: { fetch: createMetadataFetch() },
        config: sdkConfigV1_3,
        credentialIssuerUrl
      })
    ).rejects.toThrow(
      "authorizationServer must match one of the Credential Issuer metadata authorization_servers"
    );
  });
});
