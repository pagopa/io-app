jest.mock("expo-modules-core", () => ({
  requireNativeModule: jest.fn(() => ({
    generate: jest.fn(),
    getPublicKey: jest.fn(),
    getPublicKeyFixed: jest.fn(),
    deletePublicKey: jest.fn(),
    signUTF8Text: jest.fn(),
    isKeyStrongboxBacked: jest.fn(),
    verifyCertificateChain: jest.fn()
  }))
}));

import { requireNativeModule } from "expo-modules-core";

import {
  deleteKey,
  generate,
  getPublicKey,
  getPublicKeyFixed,
  isKeyStrongboxBacked,
  sign,
  verifyCertificateChain
} from "../index";

const nativeModule = jest.mocked(requireNativeModule).mock.results[0].value;
const keyTag = "existing-key-tag";
const publicKey = { kty: "EC", crv: "P-256", x: "x-value", y: "y-value" };
const options = { connectTimeout: 15000, readTimeout: 15000, requireCrl: true };

describe("Expo crypto", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    {
      name: "generate",
      call: () => generate(keyTag),
      args: [keyTag],
      value: publicKey
    },
    {
      name: "getPublicKey",
      call: () => getPublicKey(keyTag),
      args: [keyTag],
      value: publicKey
    },
    {
      name: "getPublicKeyFixed",
      call: () => getPublicKeyFixed(keyTag),
      args: [keyTag],
      value: publicKey
    },
    {
      name: "deletePublicKey",
      call: () => deleteKey(keyTag),
      args: [keyTag],
      value: undefined
    },
    {
      name: "signUTF8Text",
      call: () => sign("message", keyTag),
      args: ["message", keyTag],
      value: "signature"
    },
    {
      name: "isKeyStrongboxBacked",
      call: () => isKeyStrongboxBacked(keyTag),
      args: [keyTag],
      value: true
    },
    {
      name: "verifyCertificateChain",
      call: () => verifyCertificateChain(["leaf", "issuer"], "anchor", options),
      args: [["leaf", "issuer"], "anchor", options],
      value: { isValid: true, status: "VALID", errorMessage: "" }
    }
  ])(
    "forwards $name arguments and results unchanged",
    async ({ name, call, args, value }) => {
      nativeModule[name].mockResolvedValueOnce(value);

      await expect(call()).resolves.toEqual(value);
      expect(nativeModule[name]).toHaveBeenCalledWith(...args);
      expect(nativeModule[name]).toHaveBeenCalledTimes(1);
    }
  );

  it("preserves native errors", async () => {
    const error = Object.assign(new Error("KEY_ALREADY_EXISTS"), {
      code: "KEY_ALREADY_EXISTS",
      userInfo: { keyTag }
    });
    nativeModule.generate.mockRejectedValueOnce(error);

    await expect(generate(keyTag)).rejects.toBe(error);
  });

  test.each([
    { name: "Android", code: "KEY_ALREADY_EXISTS" },
    { name: "iOS", code: "-1" }
  ])("preserves $name error messages, codes and userInfo", async ({ code }) => {
    const cryptoError = {
      code,
      message: "KEY_ALREADY_EXISTS",
      userInfo: { keyTag }
    };
    nativeModule.generate.mockResolvedValueOnce({ cryptoError });

    await expect(generate(keyTag)).rejects.toMatchObject(cryptoError);
  });
});
