import MockDate from "mockdate";
import { constants } from "../constants";
import {
  generateSignatureInput,
  generateSignatureBase,
  generateSignature
} from "../signature";
import { SignatureConfig } from "../types/SignatureConfig";
import { brokenMockSigner, mockSigner } from "../__mocks__/mockSigners";
import { getError } from "./../../errors";

// eslint-disable-next-line functional/no-let
const testHeaders: Record<any, string> = {
  "": ""
};
// eslint-disable-next-line functional/no-let
const testHeadersWithContentDigest: Record<any, string> = {
  "content-digest": "sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:",
  ...testHeaders
};

const testConfig: SignatureConfig = {
  signAlgorithm: "ecdsa-p256-sha256",
  signKeyTag: "lp-temp-key",
  signKeyId: "AF2G87coad7/KJl9800==",
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
      'sig1=("@method" "@path" "@authority");created=1623029400;alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="'
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
      'sig1=("content-digest" "@method" "@path" "@authority");created=1623029400;alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="'
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
"@signature-params": ("@method" "@path" "@authority");created=1623029400;alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="`;
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
"@signature-params": ("content-digest" "@method" "@path" "@authority");created=1623029400;alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="`;
    expect(signatureBase).toBe(expectedBase);
  });
});

describe(`Test generate signature`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${testConfig}`, async () => {
    const signer = mockSigner;
    const signature = await generateSignature(testHeaders, testConfig, signer);
    expect(signature.length).toBeGreaterThan(0);
  });
});

describe(`Test generate signature`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${testConfig}`, async () => {
    const signer = brokenMockSigner;
    try {
      await generateSignature(testHeaders, testConfig, signer);
    } catch (e) {
      const message = getError(e).message;
      // brokenMockSigner reject every sign request
      expect(message.length).toBeGreaterThan(0);
      return;
    }
    // This should not happen.
    expect(false).toBe(true);
  });
});
