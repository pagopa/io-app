import { PublicKey } from "@pagopa/io-react-native-crypto";
import { LollipopConfig } from "../..";
import { KeyInfo } from "../crypto";
import { lollipopRequestInit } from "../fetch";
import { getUnixTimestamp } from "../../httpSignature/signature";

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

const testInit = (timestamp: number, signBody: boolean = false) => ({
  headers: {
    Authorization: "Bearer 123",
    "x-pagopa-lollipop-original-method": "GET",
    "x-pagopa-lollipop-original-url": "https://localhost:3000/method",
    signature: "sig1=:MockSignature:",
    "signature-input": `sig1=(${
      signBody ? '"content-digest" ' : ""
    }"x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=${timestamp};nonce="nonce";alg="ecdsa-p256-sha256";keyid="SXn6l6BNlwAb60cJUKpvKB3H-UQbe2slQ_8LBR70cfA"`
  },
  method: "GET"
});

const testContentDigest =
  "sha-256=:Iw2DWNyOiJC0xY3utikS7i8gNXrpKlzIYbmOaP4xrLU=:";

describe("Test lollipopRequestInit", () => {
  it("should succeed if all is set correctly", async () => {
    const init = await lollipopRequestInit(
      lollipopConfig,
      keyInfo,
      fullUrl,
      requestInit
    );
    expect(init).toStrictEqual(testInit(getUnixTimestamp()));
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
    const initToMatch = testInit(getUnixTimestamp(), true);
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
    const initToMatch = testInit(timestamp);
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
