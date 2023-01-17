import MockDate from "mockdate";
import { constants } from "../constants";
import { generateSignatureInput, generateSignatureBase } from "../signature";
import { Config } from "../types/Config";

// eslint-disable-next-line functional/no-let
const testHeaders: Record<any, string> = {
  "": ""
};
// eslint-disable-next-line functional/no-let
const testHeadersWithContentDigest: Record<any, string> = {
  "content-digest": "sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:",
  ...testHeaders
};

const testConfig: Config = {
  digestAlgorithm: "",
  signAlgorithm: "ecdsa-p256-sha256",
  signatureComponents: {
    method: "POST",
    authority: "example.com",
    path: "/hello",
    requestTarget: "/hello?name=world",
    scheme: "https",
    targetUri: "https://example.com/hello?name=world"
  },
  signatureParams: ["content-digest", "@method", "@path", "@authority"]
};

MockDate.set("2021-06-07T01:30:00.000Z");

describe(`Test signature input generation`, () => {
  it(`without "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, () => {
    const signatureInput = generateSignatureInput(testHeaders, testConfig);
    expect(signatureInput).toBe(
      'sig1=("@method" "@path" "@authority");created=1623029400;alg=ecdsa-p256-sha256'
    );
  });
});

describe(`Test signature input generation with "${constants.HEADERS.CONTENT_DIGEST}"`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, () => {
    const signatureInput = generateSignatureInput(
      testHeadersWithContentDigest,
      testConfig
    );
    expect(signatureInput).toBe(
      'sig1=("content-digest" "@method" "@path" "@authority");created=1623029400;alg=ecdsa-p256-sha256'
    );
  });
});

describe(`Test generate signature base`, () => {
  it(`without "${constants.HEADERS.CONTENT_DIGEST}" for config ${testConfig}`, () => {
    const signatureBase = generateSignatureBase(
      testHeaders,
      testConfig
    ).signatureBase;
    const expectedBase = `"@method": POST
"@path": /hello
"@authority": example.com
"@signature-params": ("@method" "@path" "@authority");created=1623029400;alg=ecdsa-p256-sha256`;
    expect(signatureBase).toBe(expectedBase);
  });
});

describe(`Test generate signature base`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${testConfig}`, () => {
    const signatureBase = generateSignatureBase(
      testHeadersWithContentDigest,
      testConfig
    ).signatureBase;
    const expectedBase = `"content-digest": sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:
"@method": POST
"@path": /hello
"@authority": example.com
"@signature-params": ("content-digest" "@method" "@path" "@authority");created=1623029400;alg=ecdsa-p256-sha256`;
    expect(signatureBase).toBe(expectedBase);
  });
});
