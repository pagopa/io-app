import URLParse from "url-parse";
import * as TE from "fp-ts/lib/TaskEither";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as global from "@pagopa/io-react-native-crypto";
import {
  toSignatureComponents,
  getSignAlgorithm,
  chainSignPromises,
  handleRegenerateEphemeralKey
} from "..";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

jest.mock("../../../utils/environment", () => ({
  isLocalEnv: true
}));

describe("toSignatureComponents", () => {
  it("should return correct SignatureComponents", () => {
    const method = "GET";
    const inputUrl = new URLParse("https://example.com/path");
    const result = toSignatureComponents(method, inputUrl);

    expect(result).toEqual({
      method,
      authority: "example.com",
      path: "/path",
      scheme: "https:",
      targetUri: "https://example.com/path",
      originalUrl: "https://example.com/path"
    });
  });
});

describe("getSignAlgorithm", () => {
  it("should return ecdsa-p256-sha256 for EC key type", () => {
    const publicKey: PublicKey = {
      kty: "EC",
      crv: "P-256",
      x: "x-coordinate",
      y: "y-coordinate"
    };
    expect(getSignAlgorithm(publicKey)).toBe("ecdsa-p256-sha256");
  });

  it("should return rsa-pss-sha256 for RSA key type", () => {
    const publicKey: PublicKey = {
      kty: "RSA",
      alg: "RS256",
      e: "AQAB",
      n: "some-modulus-value"
    };
    expect(getSignAlgorithm(publicKey)).toBe("rsa-pss-sha256");
  });
});

describe("chainSignPromises", () => {
  it("should resolve all promises and return results", async () => {
    const promises = [
      TE.right({
        headerIndex: 0,
        headerPrefix: "prefix",
        headerName: "name",
        headerValue: "value",
        signature: "sig",
        signatureInput: "input"
      }),
      TE.right({
        headerIndex: 1,
        headerPrefix: "prefix2",
        headerName: "name2",
        headerValue: "value2",
        signature: "sig2",
        signatureInput: "input2"
      })
    ];

    const result = await chainSignPromises(promises);
    expect(result).toHaveLength(2);
  });

  it("should return an empty array if any promise fails", async () => {
    const promises = [
      TE.right({
        headerIndex: 0,
        headerPrefix: "prefix",
        headerName: "name",
        headerValue: "value",
        signature: "sig",
        signatureInput: "input"
      }),
      TE.left(new Error("Failure"))
    ];

    const result = await chainSignPromises(promises);
    expect(result).toEqual([]);
  });
});

describe("handleRegenerateEphemeralKey", () => {
  it("should dispatch success action and track success on key regeneration", async () => {
    const dispatch = jest.fn();
    const keyTag = "testKey";
    const isMixpanelEnabled = true;

    jest.spyOn(global, "generate").mockResolvedValue({
      kty: "EC"
    } as PublicKey);
    jest.spyOn(global, "deleteKey").mockResolvedValue(undefined);

    await handleRegenerateEphemeralKey(keyTag, isMixpanelEnabled, dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "LOLLIPOP_SET_EPHEMERAL_PUBLIC_KEY" })
    );
  });

  it("should dispatch failure action and track failure on key regeneration error", async () => {
    const dispatch = jest.fn();
    const keyTag = "testKey";
    const isMixpanelEnabled = true;

    jest
      .spyOn(global, "deleteKey")
      .mockRejectedValue(new Error("Delete key error"));

    await handleRegenerateEphemeralKey(keyTag, isMixpanelEnabled, dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "LOLLIPOP_REMOVE_EPHEMERAL_PUBLIC_KEY" })
    );
  });
});
