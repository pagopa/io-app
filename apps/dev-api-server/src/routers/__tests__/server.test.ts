import { PublicSession } from "@io-app/api-types/generated/definitions/session_manager/PublicSession";
import * as E from "fp-ts/lib/Either";
import { calculateJwkThumbprint, exportJWK, generateKeyPair } from "jose";
import supertest from "supertest";
import * as zlib from "zlib";

import { ioDevServerConfig } from "../../config";
import {
  AppUrlLoginScheme,
  authorizePath,
  ioRedirectPath,
  loginLolliPopRedirect,
  redirectUrl
} from "../../payloads/login";
import { getLoginSessionToken } from "../../persistence/sessionInfo";
import app from "../../server";
import { addApiAuthV1Prefix } from "../../utils/strings";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM } from "../public";

const request = supertest(app);

const lollipopAssertionRefHeader = "x-pagopa-lollipop-assertion-ref";

/**
 * Generates a lollipop key the way the app sends it to `/reserve` (base64url
 * encoded JWK), along with the assertion ref the app expects back.
 */
const generateLollipopKey = async () => {
  const { publicKey } = await generateKeyPair("ES256");
  const jwk = await exportJWK(publicKey);
  const thumbprint = await calculateJwkThumbprint(
    jwk,
    DEFAULT_LOLLIPOP_HASH_ALGORITHM
  );
  return {
    assertionRef: `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-${thumbprint}`,
    encodedPublicKey: Buffer.from(JSON.stringify(jwk)).toString("base64url")
  };
};

/** Reads the `AuthnRequest` ID out of a redirect carrying a `SAMLRequest`. */
const getSamlRequestIdFromRedirect = (location: string) => {
  const samlRequest =
    new URL(location, "http://localhost").searchParams.get("SAMLRequest") ?? "";
  const xml = zlib
    .inflateRawSync(Buffer.from(samlRequest, "base64"))
    .toString();
  return /ID="([^"]+)"/.exec(xml)?.[1];
};

const testForPng = async (url: string) => {
  const response = await request.get(url);
  expect(response.status).toBe(200);
  expect(response.get("content-type")).toBe("image/png");
};

it("login should response with a welcome page", async () => {
  const response = await request.get(addApiAuthV1Prefix("/login"));
  expect(response.status).toBe(302);
});

describe("login with auth should response with a redirect url", () => {
  it.each([
    {
      description: "with token only in fragment when flag is disabled",
      sendSessionTokenAsQueryParam: false
    },
    {
      description:
        "with token in query param and fragment when flag is enabled",
      sendSessionTokenAsQueryParam: true
    }
  ])("$description", async ({ sendSessionTokenAsQueryParam }) => {
    jest.replaceProperty(
      ioDevServerConfig.global,
      "sendSessionTokenAsQueryParam",
      sendSessionTokenAsQueryParam
    );

    const response = await request.get("/idp-login?authorized=1");
    const hostAndPort = response.text.match(/\/\/(.*?)\//);
    const host = hostAndPort ? hostAndPort[1] : "";
    const token = getLoginSessionToken() ?? "";

    const baseURL = `${AppUrlLoginScheme.webview}://${host}`;
    const expectedUrlInstance = new URL(redirectUrl, baseURL);

    if (sendSessionTokenAsQueryParam) {
      expectedUrlInstance.searchParams.append("token", token);
    }
    // eslint-disable-next-line functional/immutable-data
    expectedUrlInstance.hash = `token=${token}`;

    expect(response.status).toBe(302);
    expect(response.text).toBe(
      `Found. Redirecting to ${expectedUrlInstance.toString()}`
    );
  });
});

it("session should return a valid session", async () => {
  const response = await request.get(addApiAuthV1Prefix("/session"));
  expect(response.status).toBe(200);
  const session = PublicSession.decode(response.body);
  expect(E.isRight(session)).toBeTruthy();
});

it("test-login for LEGACY /test-login should always return sessionToken", async () => {
  const result = await request
    .post(addApiAuthV1Prefix("/test-login"))
    .set("x-pagopa-lollipop-pub-key-hash-algo", "sha256")
    .set(
      "x-pagopa-lollipop-pub-key",
      "eyJrdHkiOiJFQyIsInkiOiJuYkFGd0JLT3AvRnh4VHpITGgvbVdUL3NtSjllY0lxaElkK0dBemQxTFB3PSIsIngiOiJkdHhFZU5PK1B2RFdoVkM2ZnQyTFRLMlZvWHoxektpQmI4bkRyUy9sZGY4PSIsImNydiI6IlAtMjU2In0="
    )
    .set("x-pagopa-idp-id", "spid");

  expect(result.status).toBe(200);
  expect(result.body).toStrictEqual({ token: getLoginSessionToken() });
});

it("test-login for FL /test-login should always return sessionToken", async () => {
  const result = await request
    .post(addApiAuthV1Prefix("/test-login"))
    .set("x-pagopa-lollipop-pub-key-hash-algo", "sha256")
    .set(
      "x-pagopa-lollipop-pub-key",
      "eyJrdHkiOiJFQyIsInkiOiJuYkFGd0JLT3AvRnh4VHpITGgvbVdUL3NtSjllY0lxaElkK0dBemQxTFB3PSIsIngiOiJkdHhFZU5PK1B2RFdoVkM2ZnQyTFRLMlZvWHoxektpQmI4bkRyUy9sZGY4PSIsImNydiI6IlAtMjU2In0="
    )
    .set("x-pagopa-idp-id", "spid")
    .set("x-pagopa-login-type", "LV");

  expect(result.status).toBe(200);
  expect(result.body).toStrictEqual({ token: getLoginSessionToken() });
});

describe("OneIdentity reserve", () => {
  it("should return the parameters needed to build the authorize url", async () => {
    const { encodedPublicKey } = await generateLollipopKey();

    const response = await request
      .post(addApiAuthV1Prefix("/reserve"))
      .send({ lollipop_pub_key: encodedPublicKey });

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      authorization_endpoint: expect.stringMatching(
        new RegExp(`^http://.+${authorizePath}$`)
      ),
      client_id: expect.any(String),
      nonce: expect.any(String),
      redirect_uri: expect.stringMatching(
        new RegExp(`^http://.+${ioRedirectPath}$`)
      ),
      state: expect.any(String)
    });
  });

  it.each([
    { name: "is missing", body: {} },
    { name: "is empty", body: { lollipop_pub_key: "" } },
    {
      name: "is not an encoded JWK",
      body: { lollipop_pub_key: "not-a-public-key" }
    },
    {
      name: "is an encoded JSON that is not a public key",
      body: {
        lollipop_pub_key: Buffer.from(JSON.stringify({ kty: "EC" })).toString(
          "base64url"
        )
      }
    }
  ])("should respond 400 when the public key $name", async ({ body }) => {
    const response = await request
      .post(addApiAuthV1Prefix("/reserve"))
      .send(body);

    expect(response.status).toBe(400);
  });
});

describe("OneIdentity authorize", () => {
  it("should redirect the reserved authorization endpoint to the IdP login with a SAMLRequest bound to the assertion ref", async () => {
    const { assertionRef, encodedPublicKey } = await generateLollipopKey();
    const reserveResponse = await request
      .post(addApiAuthV1Prefix("/reserve"))
      .send({ lollipop_pub_key: encodedPublicKey });
    const authorizationEndpoint = new URL(
      reserveResponse.body.authorization_endpoint
    );

    const response = await request
      .get(authorizationEndpoint.pathname)
      .set(lollipopAssertionRefHeader, assertionRef);

    expect(response.status).toBe(302);
    expect(response.headers.location).toMatch(
      new RegExp(`^${loginLolliPopRedirect}\\?SAMLRequest=`)
    );
    expect(getSamlRequestIdFromRedirect(response.headers.location)).toBe(
      assertionRef
    );
  });

  // Non regression: a base64url thumbprint may contain the same "-" that
  // separates it from the hash algorithm.
  it("should keep the dashes of the thumbprint in the SAMLRequest ID", async () => {
    const assertionRef = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}--thumb-print_with-dashes-`;

    const response = await request
      .get(authorizePath)
      .set(lollipopAssertionRefHeader, assertionRef);

    expect(getSamlRequestIdFromRedirect(response.headers.location)).toBe(
      assertionRef
    );
  });

  it.each([
    { name: "is missing", assertionRef: undefined },
    { name: "has no hash algorithm prefix", assertionRef: "a-thumbprint" },
    {
      name: "has an unsupported hash algorithm",
      assertionRef: "sha512-a-thumbprint"
    },
    {
      name: "has no separator after the hash algorithm",
      assertionRef: `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}thumbprint`
    }
  ])(
    "should respond 400 when the assertion ref header $name",
    async ({ assertionRef }) => {
      const authorizeRequest = request.get(authorizePath);

      const response = await (assertionRef === undefined
        ? authorizeRequest
        : authorizeRequest.set(lollipopAssertionRefHeader, assertionRef));

      expect(response.status).toBe(400);
    }
  );
});

it("Pay webview route should always response 200", async () => {
  await testForPng("/paywebview");
});

it("Route /assets/imgs/how_to_login.png should response 200", async () => {
  await testForPng("/assets/imgs/how_to_login.png");
});

it("Reset route should response 200 and contain reset text", async () => {
  const response = await request.get("/reset");
  expect(response.status).toBe(200);
  expect(response.text).toContain("<h2>reset:</h2>");
});

it("logout should response 200", async () => {
  const response = await request.post(addApiAuthV1Prefix("/logout"));
  expect(response.status).toBe(200);
});
