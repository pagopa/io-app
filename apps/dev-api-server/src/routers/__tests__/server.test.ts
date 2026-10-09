import { PublicSession } from "@io-app/api-types/generated/definitions/session_manager/PublicSession";
import * as E from "fp-ts/lib/Either";
import { calculateJwkThumbprint, exportJWK, generateKeyPair } from "jose";
import supertest from "supertest";
import * as zlib from "zlib";

import { ioDevServerConfig } from "../../config";
import { backendStatus } from "../../payloads/backend";
import {
  AppUrlLoginScheme,
  authorizePath,
  ioRedirectPath,
  loginLolliPopRedirect,
  oneIdentityCieIdpIds,
  redirectUrl
} from "../../payloads/login";
import {
  clearAppInfo,
  getAppOs,
  getAppVersion
} from "../../persistence/appInfo";
import {
  getAuthenticationProvider,
  getLoginSessionToken
} from "../../persistence/sessionInfo";
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

describe("OneIdentity login session", () => {
  const appVersion = "2.0.0";
  const appVersionHeader = "x-pagopa-app-version";
  const webViewUserAgent =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15";
  const expiredSessionTTLinMS = 0;

  /** Enables the fast login for the app version sent to `/authorize`. */
  const enableFastLogin = (sessionTTLinMS: number) => {
    jest.replaceProperty(backendStatus.config, "fastLogin", {
      ...backendStatus.config.fastLogin,
      min_app_version: { android: "1.0.0", ios: "1.0.0" }
    });
    jest.replaceProperty(ioDevServerConfig.features, "fastLogin", {
      sessionTTLinMS
    });
  };

  /** Goes through `/reserve`, `/authorize` and the authorized IdP login. */
  const loginWithOneIdentity = async (
    reserveBody: Record<string, string>,
    authorizeHeaders: Record<string, string>
  ) => {
    const { assertionRef, encodedPublicKey } = await generateLollipopKey();
    await request
      .post(addApiAuthV1Prefix("/reserve"))
      .send({ ...reserveBody, lollipop_pub_key: encodedPublicKey });
    await request
      .get(authorizePath)
      .set({ ...authorizeHeaders, [lollipopAssertionRefHeader]: assertionRef });
    await request.get(`${loginLolliPopRedirect}?authorized=1`);
  };

  const getSession = () =>
    request
      .get(addApiAuthV1Prefix("/session"))
      .set("Authorization", `Bearer ${getLoginSessionToken()}`);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      name: "should expire an LV session once its TTL is over",
      loginType: "LV",
      sessionTTLinMS: expiredSessionTTLinMS,
      expectedStatus: 401
    },
    {
      name: "should keep an LV session valid within its TTL",
      loginType: "LV",
      sessionTTLinMS: ioDevServerConfig.features.fastLogin?.sessionTTLinMS ?? 0,
      expectedStatus: 200
    },
    {
      name: "should never expire a LEGACY session, even after an LV one",
      loginType: "LEGACY",
      sessionTTLinMS: expiredSessionTTLinMS,
      expectedStatus: 200
    },
    {
      name: "should never expire a session reserved without a login type",
      loginType: undefined,
      sessionTTLinMS: expiredSessionTTLinMS,
      expectedStatus: 200
    }
  ])("$name", async ({ loginType, sessionTTLinMS, expectedStatus }) => {
    enableFastLogin(sessionTTLinMS);

    await loginWithOneIdentity(loginType ? { login_type: loginType } : {}, {
      [appVersionHeader]: appVersion,
      "User-Agent": webViewUserAgent
    });

    const response = await getSession();
    expect(response.status).toBe(expectedStatus);
  });

  it("should store the app info sent to /authorize", async () => {
    clearAppInfo();

    await loginWithOneIdentity(
      {},
      { [appVersionHeader]: appVersion, "User-Agent": webViewUserAgent }
    );

    expect(getAppVersion()).toBe(appVersion);
    expect(getAppOs()).toBe("ios");
  });

  it("should not store the app info when /authorize rejects the request", async () => {
    clearAppInfo();

    const response = await request
      .get(authorizePath)
      .set({ [appVersionHeader]: appVersion, "User-Agent": webViewUserAgent });

    expect(response.status).toBe(400);
    expect(getAppVersion()).toBeUndefined();
    expect(getAppOs()).toBeUndefined();
  });

  it("should not change the login type when /reserve rejects the request", async () => {
    enableFastLogin(expiredSessionTTLinMS);
    await loginWithOneIdentity(
      { login_type: "LV" },
      { [appVersionHeader]: appVersion, "User-Agent": webViewUserAgent }
    );

    const reserveResponse = await request
      .post(addApiAuthV1Prefix("/reserve"))
      .send({ login_type: "LEGACY" });

    expect(reserveResponse.status).toBe(400);
    expect((await getSession()).status).toBe(401);
  });
});

describe("OneIdentity authentication provider", () => {
  const validAssertionRef = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM}-thumbprint`;
  const spidIdp = "https://posteid.poste.it";
  const [cieIdp, cieUatIdp] = oneIdentityCieIdpIds;

  const authorize = (idp?: string, assertionRef?: string) => {
    const authorizeRequest = request
      .get(authorizePath)
      .query(idp ? { idp } : {});
    return assertionRef
      ? authorizeRequest.set(lollipopAssertionRefHeader, assertionRef)
      : authorizeRequest;
  };

  // Each scenario runs after a login with the other provider, so that a
  // value left by a previous login would make it fail.
  it.each([
    { name: "CIE", idp: cieIdp, previousIdp: spidIdp, expected: "cie" },
    {
      name: "pre-production CIE",
      idp: cieUatIdp,
      previousIdp: spidIdp,
      expected: "cie"
    },
    { name: "SPID", idp: spidIdp, previousIdp: cieIdp, expected: "spid" },
    { name: "missing", idp: undefined, previousIdp: cieIdp, expected: "spid" }
  ])(
    "should be $expected when the idp is $name",
    async ({ idp, previousIdp, expected }) => {
      await authorize(previousIdp, validAssertionRef);

      const response = await authorize(idp, validAssertionRef);

      expect(response.status).toBe(302);
      expect(getAuthenticationProvider()).toBe(expected);
    }
  );

  it("should not change when /authorize rejects the request", async () => {
    await authorize(cieIdp, validAssertionRef);

    const response = await authorize(spidIdp);

    expect(response.status).toBe(400);
    expect(getAuthenticationProvider()).toBe("cie");
  });
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
