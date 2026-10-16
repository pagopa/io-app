import { PublicKey } from "@pagopa/io-react-native-crypto";
import MockDate from "mockdate";
import URLParse from "url-parse";

import { LollipopConfig } from "../..";
import { getUnixTimestamp } from "../../httpSignature/signature";
import { KeyInfo } from "../crypto";
import {
  customContentSignatureBases,
  customContentToSignPromises,
  CutsomContentToSignInput,
  lollipopRequestInit
} from "../fetch";

const publicKey: PublicKey = {
  crv: "P-256",
  x: "dyLTwacs5ej/nnXIvCMexUBkmdh6ArJ4GPKjHob61mE=",
  kty: "EC",
  y: "Tz0xNv++cOeLVapU/BhBS0FJydIcNcV25/ALb1HVu+s="
};

const publicKeyThumbprint = "SXn6l6BNlwAb60cJUKpvKB3H-UQbe2slQ_8LBR70cfA";

const keyInfo: KeyInfo = {
  keyTag: "a12e9221-c056-4bbc-8623-ca92df29361e",
  publicKey,
  publicKeyThumbprint
};

const lollipopConfig: LollipopConfig = {
  nonce: "nonce"
};
const fullUrl = "https://localhost:3000/method";
const requestInit: RequestInit = {
  headers: {
    Authorization: "Bearer 123"
  },
  method: "GET"
};

const configurationError =
  "Bad input parameters, unable to compose RequestAndKeyInfoForLPFetch";

jest.mock("@pagopa/io-react-native-crypto", () => ({
  sign: jest.fn().mockResolvedValue("MockSignature")
}));

MockDate.set("2023-01-01T01:00:00");
const mockTimestamp = 1672534800; // 2023-01-01T01:00:00

const testInit = (signBody = false) => ({
  headers: {
    Authorization: "Bearer 123",
    "x-pagopa-lollipop-original-method": "GET",
    "x-pagopa-lollipop-original-url": "https://localhost:3000/method",
    signature: "sig1=:MockSignature:",
    "signature-input": `sig1=(${
      signBody ? '"content-digest" ' : ""
    }"x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=${mockTimestamp};nonce="nonce";alg="ecdsa-p256-sha256";keyid="SXn6l6BNlwAb60cJUKpvKB3H-UQbe2slQ_8LBR70cfA"`
  },
  method: "GET"
});

const testContentDigest =
  "sha-256=:Iw2DWNyOiJC0xY3utikS7i8gNXrpKlzIYbmOaP4xrLU=:";

describe("Check lollipopRequestInit mocks", () => {
  describe("timestamp from getUnixTimestamp()", () => {
    it(`should be ${mockTimestamp}`, () => {
      expect(getUnixTimestamp()).toBe(mockTimestamp);
    });
  });
});

const signatureConfigForgeInput = {
  publicKey,
  keyTag: keyInfo.keyTag as string,
  lollipopConfig,
  method: "GET",
  inputUrl: new URLParse(fullUrl)
};

const baseCustomContentInput: CutsomContentToSignInput = {
  customContentToSign: undefined,
  keyInfo,
  keyTag: keyInfo.keyTag as string,
  signatureConfigForgeInput
};

const expectedSignatureInput = (headerName: string, ordinal: number) =>
  `sig${ordinal}=("${headerName}");created=${mockTimestamp};nonce="nonce";alg="ecdsa-p256-sha256";keyid="${publicKeyThumbprint}"`;

const expectedSignatureBase = (headerName: string, headerValue: string) =>
  `"${headerName}": ${headerValue}\n"@signature-params": ("${headerName}");created=${mockTimestamp};nonce="nonce";alg="ecdsa-p256-sha256";keyid="${publicKeyThumbprint}"`;

describe("customContentSignatureBases", () => {
  const baseInput = baseCustomContentInput;

  it("should return an empty array if customContentToSign is undefined", () => {
    expect(customContentSignatureBases(baseInput)).toStrictEqual([]);
  });

  it("should return an empty array if customContentToSign is an empty object", () => {
    expect(
      customContentSignatureBases({
        ...baseInput,
        customContentToSign: {}
      })
    ).toStrictEqual([]);
  });

  it("should return a single signature base for a single custom content key", () => {
    const externalMessageId = "00000000000000000005";
    const headerName = "x-pagopa-lollipop-custom-externalmessageid";
    const result = customContentSignatureBases({
      ...baseInput,
      customContentToSign: { externalMessageId }
    });

    expect(result).toStrictEqual([
      {
        signatureBase: expectedSignatureBase(headerName, externalMessageId),
        signatureInput: expectedSignatureInput(headerName, 2),
        headerIndex: 2,
        headerPrefix: "externalMessageId",
        headerName: "x-pagopa-lollipop-custom-externalMessageId",
        headerValue: externalMessageId
      }
    ]);
  });

  it("should return signature bases with incremental headerIndex for multiple custom content keys", () => {
    const externalMessageId = "00000000000000000005";
    const anotherValue = "another-value";
    const result = customContentSignatureBases({
      ...baseInput,
      customContentToSign: {
        externalMessageId,
        anotherKey: anotherValue
      }
    });

    expect(result).toStrictEqual([
      {
        signatureBase: expectedSignatureBase(
          "x-pagopa-lollipop-custom-externalmessageid",
          externalMessageId
        ),
        signatureInput: expectedSignatureInput(
          "x-pagopa-lollipop-custom-externalmessageid",
          2
        ),
        headerIndex: 2,
        headerPrefix: "externalMessageId",
        headerName: "x-pagopa-lollipop-custom-externalMessageId",
        headerValue: externalMessageId
      },
      {
        signatureBase: expectedSignatureBase(
          "x-pagopa-lollipop-custom-anotherkey",
          anotherValue
        ),
        signatureInput: expectedSignatureInput(
          "x-pagopa-lollipop-custom-anotherkey",
          3
        ),
        headerIndex: 3,
        headerPrefix: "anotherKey",
        headerName: "x-pagopa-lollipop-custom-anotherKey",
        headerValue: anotherValue
      }
    ]);
  });
});

describe("customContentToSignPromises", () => {
  const baseInput = baseCustomContentInput;

  const { sign } = jest.requireMock("@pagopa/io-react-native-crypto");

  beforeEach(() => {
    sign.mockReset().mockResolvedValue("MockSignature");
  });

  it("should return an empty array if there is no custom content to sign", async () => {
    const result = await customContentToSignPromises(baseInput);
    expect(result).toStrictEqual([]);
    expect(sign).not.toHaveBeenCalled();
  });

  it("should sign every custom content and return the results in order", async () => {
    const externalMessageId = "00000000000000000005";
    const anotherValue = "another-value";
    const result = await customContentToSignPromises({
      ...baseInput,
      customContentToSign: {
        externalMessageId,
        anotherKey: anotherValue
      }
    });

    expect(result).toStrictEqual([
      {
        headerIndex: 2,
        headerPrefix: "externalMessageId",
        headerName: "x-pagopa-lollipop-custom-externalMessageId",
        headerValue: externalMessageId,
        signature: "sig2=:MockSignature:",
        signatureInput: expectedSignatureInput(
          "x-pagopa-lollipop-custom-externalmessageid",
          2
        )
      },
      {
        headerIndex: 3,
        headerPrefix: "anotherKey",
        headerName: "x-pagopa-lollipop-custom-anotherKey",
        headerValue: anotherValue,
        signature: "sig3=:MockSignature:",
        signatureInput: expectedSignatureInput(
          "x-pagopa-lollipop-custom-anotherkey",
          3
        )
      }
    ]);
    expect(sign).toHaveBeenCalledTimes(2);
  });

  it("should return an empty array if signing any custom content fails", async () => {
    sign
      .mockResolvedValueOnce("MockSignature")
      .mockRejectedValueOnce(new Error("Failure"));

    const result = await customContentToSignPromises({
      ...baseInput,
      customContentToSign: {
        externalMessageId: "00000000000000000005",
        anotherKey: "another-value"
      }
    });

    expect(result).toStrictEqual([]);
  });
});

describe("Test lollipopRequestInit", () => {
  it("should succeed if all is set correctly", async () => {
    const init = await lollipopRequestInit(
      lollipopConfig,
      keyInfo,
      fullUrl,
      requestInit
    );
    expect(init).toStrictEqual(testInit());
  });

  it("should succeed with body signature", async () => {
    const init = await lollipopRequestInit(
      {
        ...lollipopConfig,
        signBody: true
      },
      keyInfo,
      fullUrl,
      {
        ...requestInit,
        body: "body"
      }
    );
    const initToMatch = testInit(true);
    expect(init).toStrictEqual({
      ...initToMatch,
      body: "body",
      headers: {
        "Content-Digest": testContentDigest,
        ...initToMatch.headers
      }
    });
  });

  it("should succeed with custom content", async () => {
    const externalMessageId = "00000000000000000005";
    const init = await lollipopRequestInit(
      {
        ...lollipopConfig,
        customContentToSign: {
          externalMessageId
        }
      },
      keyInfo,
      fullUrl,
      {
        ...requestInit
      }
    );
    const timestamp = getUnixTimestamp();
    const initToMatch = testInit();
    expect(init).toStrictEqual({
      ...initToMatch,
      headers: {
        ...initToMatch.headers,
        signature: `${initToMatch.headers.signature},sig2=:MockSignature:`,
        "signature-input": `${initToMatch.headers["signature-input"]},sig2=("x-pagopa-lollipop-custom-externalmessageid");created=${timestamp};nonce="nonce";alg="ecdsa-p256-sha256";keyid="SXn6l6BNlwAb60cJUKpvKB3H-UQbe2slQ_8LBR70cfA"`,
        "x-pagopa-lollipop-custom-externalMessageId": `${externalMessageId}`
      }
    });
  });

  it("should ignore custom content signature failure and keep main signature", async () => {
    const { sign } = jest.requireMock("@pagopa/io-react-native-crypto");
    sign
      .mockResolvedValueOnce("MockSignature")
      .mockRejectedValueOnce(new Error("Failure"));

    const externalMessageId = "00000000000000000005";
    const init = await lollipopRequestInit(
      {
        ...lollipopConfig,
        customContentToSign: {
          externalMessageId
        }
      },
      keyInfo,
      fullUrl,
      {
        ...requestInit
      }
    );
    expect(init).toStrictEqual(testInit());
  });

  it("should throw if no keyTag is set", async () => {
    await expect(
      lollipopRequestInit(
        lollipopConfig,
        { ...keyInfo, keyTag: undefined },
        fullUrl,
        requestInit
      )
    ).rejects.toEqual(new Error(configurationError));
  });

  it("should throw if no public key is set", async () => {
    await expect(
      lollipopRequestInit(
        lollipopConfig,
        { ...keyInfo, publicKey: undefined },
        fullUrl,
        requestInit
      )
    ).rejects.toEqual(new Error(configurationError));
  });

  it("should throw if input is not a string", async () => {
    await expect(
      lollipopRequestInit(lollipopConfig, keyInfo, {} as Request, requestInit)
    ).rejects.toEqual(new Error(configurationError));
  });

  it("should throw if no headers are set", async () => {
    await expect(
      lollipopRequestInit(lollipopConfig, keyInfo, fullUrl, {
        ...requestInit,
        headers: undefined
      })
    ).rejects.toEqual(new Error(configurationError));
  });

  it("should throw if no request method is set", async () => {
    await expect(
      lollipopRequestInit(lollipopConfig, keyInfo, fullUrl, {
        ...requestInit,
        method: undefined
      })
    ).rejects.toEqual(new Error(configurationError));
  });
});
