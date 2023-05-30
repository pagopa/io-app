import { PublicKey } from "@pagopa/io-react-native-crypto";
import { LollipopConfig } from "../..";
import { KeyInfo } from "../crypto";
import { lollipopRequestInit } from "../fetch";

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

describe("Test lollipopRequestInit", () => {
  it("should throw if no keyTag is set", async () => {
    try {
      return await lollipopRequestInit(
        lollipopConfig,
        { ...keyInfo, keyTag: undefined },
        fullUrl,
        requestInit
      );
    } catch (e) {
      return expect(`${e}`).toMatch(configurationError);
    }
  });

  it("should throw if no public key is set", async () => {
    try {
      return await lollipopRequestInit(
        lollipopConfig,
        { ...keyInfo, publicKey: undefined },
        fullUrl,
        requestInit
      );
    } catch (e) {
      return expect(`${e}`).toMatch(configurationError);
    }
  });

  it("should throw if input is not a string", async () => {
    const fullUrlRequest = {} as Request;
    try {
      return await lollipopRequestInit(
        lollipopConfig,
        keyInfo,
        fullUrlRequest,
        requestInit
      );
    } catch (e) {
      return expect(`${e}`).toMatch(configurationError);
    }
  });

  it("should throw if no headers are set", async () => {
    try {
      return await lollipopRequestInit(lollipopConfig, keyInfo, fullUrl, {
        ...requestInit,
        headers: undefined
      });
    } catch (e) {
      return expect(`${e}`).toMatch(configurationError);
    }
  });

  it("should throw if no request method is set", async () => {
    try {
      return await lollipopRequestInit(lollipopConfig, keyInfo, fullUrl, {
        ...requestInit,
        method: undefined
      });
    } catch (e) {
      return expect(`${e}`).toMatch(configurationError);
    }
  });
});
