import { none, Option, some } from "fp-ts/lib/Option";
import { extractLoginResult, getIntentFallbackUrl } from "../login";
import { SessionToken } from "../../types/SessionToken";

describe("hook the login outcome from the url", () => {
  const remoteHost = "https://somedomain.com/somepath";
  const successSuffix = "/profile.html?token=";
  const successToken = "ABCDFG0123456" as SessionToken;
  const success = remoteHost + successSuffix + successToken;

  const successRedirects: ReadonlyArray<
    [string, ReturnType<typeof extractLoginResult>]
  > = [
    [success, { success: true, token: successToken }],
    // with other params
    [
      success + "&param1=abc&param2=123",
      { success: true, token: successToken }
    ],
    // with token as not the first param
    [
      `${remoteHost}/profile.html?param1=987&token=${successToken}&param2=123`,
      { success: true, token: successToken }
    ],
    // with token defined but empty
    [`${remoteHost + successSuffix}`, { success: false }],
    // with no token
    [`${remoteHost}/profile.html`, { success: false }],
    // with no success suffix
    [`${remoteHost}/anotherPath.html?token=${successToken}`, undefined],
    // with no success suffix
    [`${remoteHost}/?token=${successToken}`, undefined]
  ];

  test.each(successRedirects)(
    "given %p as redirect url, return %p",
    (firstArg, expectedResult) => {
      const result = extractLoginResult(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );

  // failure
  const failureSuffix = "/error.html";
  const errorCode = "123456";
  const failureSuffixWithCode = "/error.html?errorCode=";
  const failureNoCode = remoteHost + failureSuffix;
  const failureWithCode = remoteHost + failureSuffixWithCode + errorCode;

  const errorsRedirects: ReadonlyArray<
    [string, ReturnType<typeof extractLoginResult>]
  > = [
    [failureWithCode, { success: false, errorCode }],
    // with other params
    [failureWithCode + "&param1=abc&param2=123", { success: false, errorCode }],
    // with errorCode as not the first param
    [
      `${failureNoCode}?param1=abc&errorCode=${errorCode}&param2=987`,
      { success: false, errorCode }
    ],
    // with errorCode defined but empty
    [
      `${failureNoCode}?param1=abc&errorCode=&param2=987`,
      { success: false, errorCode: undefined }
    ],
    // with no errorCode
    [
      `${failureNoCode}?param1=abc=&param2=987`,
      { success: false, errorCode: undefined }
    ]
  ];

  test.each(errorsRedirects)(
    "given %p as redirect url, return %p",
    (firstArg, expectedResult) => {
      const result = extractLoginResult(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("getIntentFallbackUrl", () => {
  const isIntentSchemeCases: ReadonlyArray<[string, Option<string>]> = [
    ["", none],
    ["https://www.google.com", none],
    ["intent:", none],
    ["intent://", none],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb;end",
      some("https://domain.it/?tranId=acb")
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb",
      none
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;end",
      none
    ],
    [
      "intent://domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;fallback_url=https://domain.it/?tranId=acb;end",
      none
    ],
    [
      "intent:/domain.test.it/?tranId=abc#Intent;scheme=https;package=com.test.it;S.browser_fallback_url=https://domain.it/?tranId=acb;end",
      none
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
