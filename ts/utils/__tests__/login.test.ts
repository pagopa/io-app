import * as O from "fp-ts/lib/Option";
import { extractLoginResult, getIntentFallbackUrl } from "../login";
import { SessionToken } from "../../types/SessionToken";

describe("hook the login outcome from the url", () => {
  const remoteHost = "https://somedomain.com/somepath";
  const successSuffix = "/profile.html?token=";
  const successToken = "ABCDFG0123456" as SessionToken;
  const success = remoteHost + successSuffix + successToken;
  const failureSuffix = "/error.html";
  const errorCode = "123456";
  const failureSuffixWithCode = failureSuffix + "?errorCode=";
  const failureNoCode = remoteHost + failureSuffix;
  const failureWithCode = remoteHost + failureSuffixWithCode + errorCode;

  const urlRedirects: ReadonlyArray<
    [string, string, ReturnType<typeof extractLoginResult>]
  > = [
    ["success happy case", success, { success: true, token: successToken }],

    [
      "with other params",
      success + "&param1=abc&param2=123",
      { success: true, token: successToken }
    ],

    [
      "with token as not the first param",
      `${remoteHost}/profile.html?param1=987&token=${successToken}&param2=123`,
      { success: true, token: successToken }
    ],

    [
      "with token defined but empty",
      `${remoteHost + successSuffix}`,
      { success: false }
    ],
    ["with no token", `${remoteHost}/profile.html`, { success: false }],
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
    ["empty url", `someStrangeInput`, undefined],
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
