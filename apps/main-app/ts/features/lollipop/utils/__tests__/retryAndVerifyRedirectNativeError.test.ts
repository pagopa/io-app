import { PublicKey } from "@pagopa/io-react-native-crypto";
import { LoginUtilsError } from "@pagopa/io-react-native-login-utils";
import * as E from "fp-ts/lib/Either";

import { AppDispatch } from "../../../../App";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../login";

const jwkPublicKey: PublicKey = {
  crv: "P-256",
  kty: "EC",
  x: "uao9Cd3ecm/nHVJP05C5AycOuRq9+W/kFGUgPRB2Xic=",
  y: "ExlJCRzL4crzq05EGcAl8b6stmjYeBTkCiiRziKPWaY="
};

const dispatch: AppDispatch = jest.fn();
jest.mock("../..", () => {
  const actualModule = jest.requireActual("../..");
  return {
    ...actualModule,
    handleRegenerateEphemeralKey: jest
      .fn()
      .mockResolvedValue(jwkPublicKey as PublicKey)
  };
});
jest.mock("@pagopa/io-react-native-login-utils", () => ({
  getRedirects: jest.fn().mockRejectedValue({
    userInfo: {
      Error: "fake network error",
      URL: "fake url",
      StatusCode: 409,
      Parameter: undefined
    },
    code: "409"
  }),
  isLoginUtilsError: (e: unknown) =>
    (e as LoginUtilsError).userInfo !== undefined
}));

describe("Lollipop regenerate key, get redirects and verification", () => {
  it('should reject with code "409"', async () => {
    await expect(
      regenerateKeyGetRedirectsAndVerifySaml(
        "loginUri",
        "keyTag",
        false,
        false,
        dispatch
      )
    ).rejects.toEqual(expect.objectContaining({ code: "409" }));
  });
});
