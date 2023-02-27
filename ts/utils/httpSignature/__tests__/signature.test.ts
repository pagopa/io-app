import { ECKey, RSAKey } from "@pagopa/io-react-native-crypto";
import MockDate from "mockdate";
import URLParse from "url-parse";
import { LollipopConfig } from "../../../features/lollipop";
import {
  SignatureConfigForgeInput,
  CutsomContentToSignInput,
  customContentSignatureBases,
  CustomContentBaseSignature
} from "../../../features/lollipop/utils/fetch";
import { KeyInfo } from "../../crypto";
import { constants } from "../constants";
import {
  generateSignatureInput,
  generateSignatureBase,
  generateSignature
} from "../signature";
import { SignatureConfig } from "../types/SignatureConfig";
import { brokenMockSigner, mockSigner } from "../__mocks__/mockSigners";
import { getError } from "./../../errors";

const testHeaders: Record<any, string> = {
  "": ""
};
const testHeadersWithContentDigest: Record<any, string> = {
  "Content-Digest": "sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:",
  ...testHeaders
};

const testCustomHeaders = {
  "x-pagopa-lollipop-original-method": "GET",
  "x-pagopa-lollipop-original-url": "/api/v1/profile"
};
const testCustomHeadersWithContentDigest = {
  "Content-Digest": "sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:",
  "Content-Type": "application/json",
  "Content-Length": "18",
  ...testCustomHeaders
};

const publicKeyECKey: ECKey = {
  kty: "EC",
  crv: "P-256K",
  x: "xKey",
  y: "yKey"
};

const publicKeyRSAKey: RSAKey = {
  kty: "RSA",
  alg: "rsa",
  e: "eKey",
  n: "nKey"
};

const testKeyInfoWithECKey: Required<KeyInfo> = {
  keyTag: "AAA",
  publicKey: publicKeyECKey,
  publicKeyThumbprint: "testThumbprint"
};

const testKeyInfoWithRSAKey: KeyInfo = {
  keyTag: "AAA",
  publicKey: publicKeyRSAKey,
  publicKeyThumbprint: "testThumbprint"
};

const testLollipopConfigWithCustomContent: LollipopConfig = {
  nonce: "xyz123",
  customContentToSign: { tos: "ASDFFA324SDFA==", sign: "DAFDEFAF323DSFA==" }
};

const testSignatureConfigForgeInputWithCustomContentAndECKey: SignatureConfigForgeInput =
  {
    publicKey: testKeyInfoWithECKey.publicKey!,
    keyTag: testKeyInfoWithRSAKey.keyTag!,
    lollipopConfig: testLollipopConfigWithCustomContent,
    method: "POST",
    inputUrl: URLParse("https://example.com/hello?name=world"),
    originalUrl: "example.com"
  };

const testSignatureConfigForgeInputWithCustomContentAndRSAKey: SignatureConfigForgeInput =
  {
    publicKey: testKeyInfoWithRSAKey.publicKey!,
    keyTag: testKeyInfoWithRSAKey.keyTag!,
    lollipopConfig: testLollipopConfigWithCustomContent,
    method: "POST",
    inputUrl: URLParse("https://example.com/hello?name=world"),
    originalUrl: "example.com"
  };

const testConfig: SignatureConfig = {
  signAlgorithm: "ecdsa-p256-sha256",
  signKeyTag: "lp-temp-key",
  signKeyId: "AF2G87coad7/KJl9800==",
  nonce: "xyz",
  signatureComponents: {
    method: "POST",
    authority: "example.com",
    path: "/hello",
    requestTarget: "/hello?name=world",
    scheme: "https",
    targetUri: "https://example.com/hello?name=world"
  },
  signatureParams: ["Content-Digest", "@method", "@path", "@authority"]
};

const testCustomHeadersConfig: SignatureConfig = {
  signAlgorithm: "ecdsa-p256-sha256",
  signKeyTag: "lp-temp-key",
  signKeyId: "AF2G87coad7/KJl9800==",
  nonce: "xyz",
  signatureComponents: {
    method: "POST",
    authority: "example.com",
    path: "/hello",
    requestTarget: "/hello?name=world",
    scheme: "https",
    targetUri: "https://example.com/hello?name=world"
  },
  signatureParams: [
    "Content-Digest",
    "Content-Type",
    "Content-Length",
    "x-pagopa-lollipop-original-method",
    "x-pagopa-lollipop-original-url"
  ]
};

MockDate.set("2021-06-07T01:30:00.000Z");

describe(`Test signature input generation`, () => {
  it(`without "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, () => {
    const signatureInput = generateSignatureInput(testHeaders, testConfig);
    expect(signatureInput).toBe(
      'sig1=("@method" "@path" "@authority");created=1623029400;nonce="xyz";alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="'
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
      'sig1=("content-digest" "@method" "@path" "@authority");created=1623029400;nonce="xyz";alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="'
    );
  });
});

describe(`Test generate signature base`, () => {
  it(`without "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, () => {
    const signatureBase = generateSignatureBase(
      testHeaders,
      testConfig
    ).signatureBase;
    const expectedBase = `"@method": POST
"@path": /hello
"@authority": example.com
"@signature-params": ("@method" "@path" "@authority");created=1623029400;nonce="xyz";alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="`;
    expect(signatureBase).toBe(expectedBase);
  });
});

describe(`Test generate signature base`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, () => {
    const signatureBase = generateSignatureBase(
      testHeadersWithContentDigest,
      testConfig
    ).signatureBase;
    const expectedBase = `"content-digest": sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:
"@method": POST
"@path": /hello
"@authority": example.com
"@signature-params": ("content-digest" "@method" "@path" "@authority");created=1623029400;nonce="xyz";alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="`;
    expect(signatureBase).toBe(expectedBase);
  });
});

describe(`Test generate signature base`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testCustomHeadersConfig
  )}`, () => {
    const signatureBase = generateSignatureBase(
      testCustomHeadersWithContentDigest,
      testCustomHeadersConfig
    ).signatureBase;
    const expectedBase = `"content-digest": sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:
"content-type": application/json
"content-length": 18
"x-pagopa-lollipop-original-method": GET
"x-pagopa-lollipop-original-url": /api/v1/profile
"@signature-params": ("content-digest" "content-type" "content-length" "x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=1623029400;nonce="xyz";alg="ecdsa-p256-sha256";keyid="AF2G87coad7/KJl9800=="`;
    expect(signatureBase).toBe(expectedBase);
  });
});

describe(`Test generate signature base for multiple custom signatures RSAKey`, () => {
  const customContent: CutsomContentToSignInput = {
    customContentToSign: { tos: "ASDFFA324SDFA==", sign: "DAFDEFAF323DSFA==" },
    keyInfo: testKeyInfoWithRSAKey,
    keyTag: testKeyInfoWithRSAKey.keyTag!,
    signatureConfigForgeInput:
      testSignatureConfigForgeInputWithCustomContentAndRSAKey
  };
  it(`should generate a base for every signature in customContent`, () => {
    const signatureBase = customContentSignatureBases(customContent);
    signatureBase.forEach((base, index) => {
      const nonce: string =
        customContent.signatureConfigForgeInput.lollipopConfig.nonce;
      const headerPrefix: string = base.headerPrefix;
      const headerIndex: number = index + 2;
      const headerValue: string =
        customContent.customContentToSign![headerPrefix];
      const publicKeyThumbprint: string =
        customContent.keyInfo.publicKeyThumbprint!;

      const controlObject: CustomContentBaseSignature = {
        signatureBase:
          `"x-pagopa-lollipop-custom-${headerPrefix}": ${headerValue}\n` +
          `"@signature-params": ("x-pagopa-lollipop-custom-${headerPrefix}");created=1623029400;nonce="${nonce}";alg="rsa-pss-sha256";keyid="${publicKeyThumbprint}"`,
        signatureInput: `sig${headerIndex}=("x-pagopa-lollipop-custom-${headerPrefix}");created=1623029400;nonce="${nonce}";alg="rsa-pss-sha256";keyid="testThumbprint"`,
        headerIndex,
        headerPrefix,
        headerName: `x-pagopa-lollipop-custom-${headerPrefix}`,
        headerValue
      };

      expect(controlObject).toEqual(base);
    });
  });
});

describe(`Test generate signature base for multiple custom signatures ECKey`, () => {
  const customContent: CutsomContentToSignInput = {
    customContentToSign: { tos: "ASDFFA324SDFA==", sign: "DAFDEFAF323DSFA==" },
    keyInfo: testKeyInfoWithECKey,
    keyTag: testKeyInfoWithECKey.keyTag!,
    signatureConfigForgeInput:
      testSignatureConfigForgeInputWithCustomContentAndECKey
  };
  it(`should generate a base for every signature in customContent`, () => {
    const signatureBase = customContentSignatureBases(customContent);
    signatureBase.forEach((base, index) => {
      const nonce: string =
        customContent.signatureConfigForgeInput.lollipopConfig.nonce;
      const headerPrefix: string = base.headerPrefix;
      const headerIndex: number = index + 2;
      const headerValue: string =
        customContent.customContentToSign![headerPrefix];
      const publicKeyThumbprint: string =
        customContent.keyInfo.publicKeyThumbprint!;

      const controlObject: CustomContentBaseSignature = {
        signatureBase:
          `"x-pagopa-lollipop-custom-${headerPrefix}": ${headerValue}\n` +
          `"@signature-params": ("x-pagopa-lollipop-custom-${headerPrefix}");created=1623029400;nonce="${nonce}";alg="ecdsa-p256-sha256";keyid="${publicKeyThumbprint}"`,
        signatureInput: `sig${headerIndex}=("x-pagopa-lollipop-custom-${headerPrefix}");created=1623029400;nonce="${nonce}";alg="ecdsa-p256-sha256";keyid="testThumbprint"`,
        headerIndex,
        headerPrefix,
        headerName: `x-pagopa-lollipop-custom-${headerPrefix}`,
        headerValue
      };

      expect(controlObject).toEqual(base);
    });
  });
});

describe(`Test generate signature`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, async () => {
    const signer = mockSigner;
    const signature = await generateSignature(testHeaders, testConfig, signer);
    expect(signature.length).toBeGreaterThan(0);
  });
});

describe(`Test generate signature`, () => {
  it(`with "${constants.HEADERS.CONTENT_DIGEST}" for config ${JSON.stringify(
    testConfig
  )}`, async () => {
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
