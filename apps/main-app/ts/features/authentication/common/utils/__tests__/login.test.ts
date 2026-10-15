import { PublicKey } from "@pagopa/io-react-native-crypto";

import {
  extractLoginResult,
  getIntentFallbackUrl,
  getLoginHeaders,
  isValidCallbackUrl
} from "..";

const mockApiUrlPrefix = "https://mock-api.io.pagopa.it";

jest.mock("../../../../../utils/environment", () => ({
  isLocalEnv: true
}));

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

jest.mock("../../../../../config", () => ({
  apiUrlPrefix: "https://mock-api.io.pagopa.it",
  spidRelayState: "mock-relay-state"
}));

describe("hook the login outcome from the url", () => {
  const remoteHost = "https://somedomain.com/somepath";
  const successSuffix = "/profile.html";
  const successToken = "mock-token";
  const failureSuffix = "/error.html";
  const errorCode = "123456";
  const failureSuffixWithCode = failureSuffix + "?errorCode=";
  const failureNoCode = remoteHost + failureSuffix;
  const failureWithCode = remoteHost + failureSuffixWithCode + errorCode;

  const urlRedirects: ReadonlyArray<
    [string, string, ReturnType<typeof extractLoginResult>]
  > = [
    [
      "token in query param is ignored",
      `${remoteHost}${successSuffix}?token=${successToken}`,
      { success: false }
    ],
    [
      "token in query param with other params is ignored",
      `${remoteHost}${successSuffix}?token=${successToken}&param1=abc&param2=123`,
      { success: false }
    ],
    [
      "token in query param not first is ignored",
      `${remoteHost}${successSuffix}?param1=987&token=${successToken}&param2=123`,
      { success: false }
    ],

    [
      "success happy case (fragment)",
      `${remoteHost}${successSuffix}#token=${successToken}`,
      { success: true, token: successToken }
    ],
    [
      "fragment priority over query param",
      `${remoteHost}${successSuffix}?token==${successToken}#token=${successToken}`,
      { success: true, token: successToken }
    ],
    [
      "fragment with other params",
      `${remoteHost}${successSuffix}#other=xyz&token=${successToken}`,
      { success: true, token: successToken }
    ],
    [
      "fragment token as first param",
      `${remoteHost}${successSuffix}#token=${successToken}&other=123`,
      { success: true, token: successToken }
    ],

    [
      "no fallback to query if fragment is empty",
      `${remoteHost}${successSuffix}?token=${successToken}#`,
      { success: false }
    ],
    [
      "no fallback to query if fragment exists but has no token",
      `${remoteHost}${successSuffix}?token=${successToken}#other=123`,
      { success: false }
    ],
    [
      "no fallback to query if fragment token is empty string",
      `${remoteHost}${successSuffix}?token=${successToken}#token=`,
      { success: false }
    ],

    [
      "with token empty in fragment and missing in query",
      `${remoteHost}${successSuffix}#token=`,
      { success: false }
    ],
    ["with no token", `${remoteHost}${successSuffix}`, { success: false }],
    [
      "with token and not expected success suffix",
      `${remoteHost}/anotherPath.html?token=${successToken}`,
      undefined
    ],
    [
      "with token and no success suffix",
      `${remoteHost}/?token=${successToken}`,
      undefined
    ],
    ["invalid url", `someStrangeInput`, undefined],
    ["empty url", "", undefined],
    ["failure happy case", failureWithCode, { success: false, errorCode }],
    [
      "error code with other params",
      failureWithCode + "&param1=abc&param2=123",
      { success: false, errorCode }
    ],
    [
      "with errorCode as not the first param",
      `${failureNoCode}?param1=abc&errorCode=${errorCode}&param2=987`,
      { success: false, errorCode }
    ],
    [
      "with errorCode defined but empty",
      `${failureNoCode}?param1=abc&errorCode=&param2=987`,
      { success: false, errorCode: undefined }
    ],
    [
      "with no errorCode",
      `${failureNoCode}?param1=abc=&param2=987`,
      { success: false, errorCode: undefined }
    ]
  ];

  test.each(urlRedirects)(
    "with case %p, given %p as input, expected result %p",
    (_, url, expectedResult) => {
      const result = extractLoginResult(url);
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("getIntentFallbackUrl", () => {
  const isIntentSchemeCases: ReadonlyArray<[string, string | undefined]> = [
    ["", undefined],
    ["https://www.google.com", undefined],
    ["intent:", undefined],
    ["intent://", undefined],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb;end",
      "https://domain.it/?tranId=acb"
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb",
      undefined
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;end",
      undefined
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;fallback_url=https://domain.it/?tranId=acb;end",
      undefined
    ],
    [
      "intent:/domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb;end",
      undefined
    ]
  ];
  test.each(isIntentSchemeCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = getIntentFallbackUrl(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("getLoginHeaders", () => {
  it("should return correct headers", () => {
    const publicKey: PublicKey = {
      kty: "EC",
      crv: "P-256",
      x: "x-coordinate",
      y: "y-coordinate"
    };
    const hashAlgorithm = "SHA256";
    const isFastLogin = true;
    const idpId = "idp123";

    const headers = getLoginHeaders(
      publicKey,
      hashAlgorithm,
      isFastLogin,
      idpId
    );

    expect(headers).toEqual({
      "x-pagopa-lollipop-pub-key": expect.any(String),
      "x-pagopa-lollipop-pub-key-hash-algo": hashAlgorithm,
      "x-pagopa-app-version": expect.any(String),
      "x-pagopa-login-type": "LV",
      "x-pagopa-idp-id": idpId
    });
  });
});

describe("isValidCallbackUrl", () => {
  const callbackUrlCases: ReadonlyArray<[string, string, boolean]> = [
    [
      "v1 callback URL is a valid callback",
      `${mockApiUrlPrefix}/api/auth/v1/callback`,
      true
    ],
    [
      "v2 callback URL is a valid callback",
      `${mockApiUrlPrefix}/api/auth/v2/callback`,
      true
    ],
    [
      "URL with an unrelated path is not a valid callback",
      `${mockApiUrlPrefix}/api/auth/v1/login`,
      false
    ],
    [
      "URL that only contains the callback path as a substring is not a valid callback",
      `${mockApiUrlPrefix}/api/auth/v1/callback/extra-path`,
      false
    ],
    [
      "URL with a different host is not a valid callback",
      "https://evil.com/api/auth/v2/callback",
      false
    ]
  ];

  test.each(callbackUrlCases)("%s", (_, url, expectedResult) => {
    expect(isValidCallbackUrl(url)).toBe(expectedResult);
  });
});
