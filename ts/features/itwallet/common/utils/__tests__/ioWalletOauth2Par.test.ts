import {
  type CallbackContext,
  createPushedAuthorizationRequest,
  isPushedAuthorizationRequestSigned,
  isPushedAuthorizationRequestUnsigned,
  type Jwk
} from "@pagopa/io-wallet-oauth2";

const AUDIENCE = "https://issuer.example.com";
const CLIENT_ID = "client-id";
const CODE_VERIFIER = "code-verifier";
const CREDENTIAL_CONFIGURATION_ID = "credential-id";
const HASH_LENGTH = 32;
const ISSUER_STATE = "issuer-session-id";
const JTI = "jti";
const REDIRECT_URI = "https://wallet.example.com/callback";
const RESPONSE_MODE = "query";
const SIGNED_REQUEST_JWT = "signed-request-jwt";
const STATE = "state";

const DPOP_PUBLIC_JWK: Jwk = {
  crv: "P-256",
  kid: "dpop-key-id",
  kty: "EC",
  x: "x-coordinate",
  y: "y-coordinate"
};

const createCallbacks = () => {
  const signJwt: jest.MockedFunction<CallbackContext["signJwt"]> = jest.fn(
    (_jwtSigner, _jwt) => ({
      jwt: SIGNED_REQUEST_JWT,
      signerJwk: DPOP_PUBLIC_JWK
    })
  );

  const callbacks: Pick<
    CallbackContext,
    "generateRandom" | "hash" | "signJwt"
  > = {
    generateRandom: byteLength => new Uint8Array(byteLength),
    hash: () => new Uint8Array(HASH_LENGTH),
    signJwt
  };

  return { callbacks, signJwt };
};

const createBaseOptions = (
  callbacks: Pick<CallbackContext, "generateRandom" | "hash" | "signJwt">
) => ({
  audience: AUDIENCE,
  authorization_details: [
    {
      credential_configuration_id: CREDENTIAL_CONFIGURATION_ID,
      type: "openid_credential" as const
    }
  ],
  callbacks,
  clientId: CLIENT_ID,
  codeChallengeMethodsSupported: ["S256"],
  jti: JTI,
  pkceCodeVerifier: CODE_VERIFIER,
  redirectUri: REDIRECT_URI,
  responseMode: RESPONSE_MODE,
  state: STATE
});

describe("createPushedAuthorizationRequest", () => {
  it("serializes issuerState as issuer_state in unsigned authorization requests", async () => {
    const { callbacks } = createCallbacks();

    const pushedAuthorizationRequest = await createPushedAuthorizationRequest({
      ...createBaseOptions(callbacks),
      authorizationServerMetadata: {
        require_signed_request_object: false
      },
      issuerState: ISSUER_STATE
    });

    expect(
      isPushedAuthorizationRequestUnsigned(pushedAuthorizationRequest)
    ).toBe(true);
    expect(
      isPushedAuthorizationRequestUnsigned(pushedAuthorizationRequest) &&
        pushedAuthorizationRequest.authorizationRequest.issuer_state
    ).toBe(ISSUER_STATE);
  });

  it("serializes issuerState as issuer_state in signed authorization requests", async () => {
    const { callbacks, signJwt } = createCallbacks();

    const pushedAuthorizationRequest = await createPushedAuthorizationRequest({
      ...createBaseOptions(callbacks),
      authorizationServerMetadata: {
        require_signed_request_object: true
      },
      dpop: {
        signer: {
          alg: "ES256",
          method: "jwk",
          publicJwk: DPOP_PUBLIC_JWK
        }
      },
      issuerState: ISSUER_STATE
    });

    expect(isPushedAuthorizationRequestSigned(pushedAuthorizationRequest)).toBe(
      true
    );
    expect(signJwt).toHaveBeenCalledTimes(1);
    expect(signJwt.mock.calls[0][1].payload.issuer_state).toBe(ISSUER_STATE);
  });

  it("omits issuer_state when issuerState is not provided", async () => {
    const unsignedCallbacks = createCallbacks();
    const signedCallbacks = createCallbacks();

    const unsignedPushedAuthorizationRequest =
      await createPushedAuthorizationRequest({
        ...createBaseOptions(unsignedCallbacks.callbacks),
        authorizationServerMetadata: {
          require_signed_request_object: false
        }
      });

    const signedPushedAuthorizationRequest =
      await createPushedAuthorizationRequest({
        ...createBaseOptions(signedCallbacks.callbacks),
        authorizationServerMetadata: {
          require_signed_request_object: true
        },
        dpop: {
          signer: {
            alg: "ES256",
            method: "jwk",
            publicJwk: DPOP_PUBLIC_JWK
          }
        }
      });

    expect(
      isPushedAuthorizationRequestUnsigned(
        unsignedPushedAuthorizationRequest
      ) &&
        "issuer_state" in
          unsignedPushedAuthorizationRequest.authorizationRequest
    ).toBe(false);
    expect(
      isPushedAuthorizationRequestSigned(signedPushedAuthorizationRequest)
    ).toBe(true);
    expect(signedCallbacks.signJwt).toHaveBeenCalledTimes(1);
    expect(
      "issuer_state" in signedCallbacks.signJwt.mock.calls[0][1].payload
    ).toBe(false);
  });
});
