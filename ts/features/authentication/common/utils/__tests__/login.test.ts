import * as O from "fp-ts/lib/Option";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import {
  extractLoginResult,
  getIntentFallbackUrl,
  getLoginHeaders
} from "../login";
import { SessionToken } from "../../../../../types/SessionToken";

jest.mock("../../../../../utils/environment", () => ({
  isLocalEnv: true
}));

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

describe("hook the login outcome from the url", () => {
  const remoteHost = "https://somedomain.com/somepath";
  const successSuffix = "/profile.html";
  const successToken = "ABCDFG0123456" as SessionToken;
  const failureSuffix = "/error.html";
  const errorCode = "123456";
  const failureSuffixWithCode = failureSuffix + "?errorCode=";
  const failureNoCode = remoteHost + failureSuffix;
  const failureWithCode = remoteHost + failureSuffixWithCode + errorCode;

  const urlRedirects: ReadonlyArray<
    [string, string, ReturnType<typeof extractLoginResult>]
  > = [
    [
      "success happy case (query param)",
      `${remoteHost}${successSuffix}?token=${successToken}`,
      { success: true, token: successToken }
    ],
    [
      "with other params (query param)",
      `${remoteHost}${successSuffix}?token=${successToken}&param1=abc&param2=123`,
      { success: true, token: successToken }
    ],
    [
      "with token as not the first param (query param)",
      `${remoteHost}${successSuffix}?param1=987&token=${successToken}&param2=123`,
      { success: true, token: successToken }
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
      `${remoteHost}${successSuffix}#state=xyz&token=${successToken}`,
      { success: true, token: successToken }
    ],
    [
      "fragment token as first param",
      `${remoteHost}${successSuffix}#token=${successToken}&other=123`,
      { success: true, token: successToken }
    ],

    [
      "fallback to query if fragment is empty",
      `${remoteHost}${successSuffix}?token=${successToken}#`,
      { success: true, token: successToken }
    ],
    [
      "fallback to query if fragment exists but has no token",
      `${remoteHost}${successSuffix}?token=${successToken}#state=123`,
      { success: true, token: successToken }
    ],
    [
      "fallback to query if fragment token is empty string",
      `${remoteHost}${successSuffix}?token=${successToken}#token=`,
      { success: true, token: successToken }
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
  const isIntentSchemeCases: ReadonlyArray<[string, O.Option<string>]> = [
    ["", O.none],
    ["https://www.google.com", O.none],
    ["intent:", O.none],
    ["intent://", O.none],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb;end",
      O.some("https://domain.it/?tranId=acb")
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb",
      O.none
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;end",
      O.none
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;fallback_url=https://domain.it/?tranId=acb;end",
      O.none
    ],
    [
      "intent:/domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb;end",
      O.none
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
