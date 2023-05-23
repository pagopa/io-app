import * as E from "fp-ts/lib/Either";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../login";
import { AppDispatch } from "../../../../App";

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
    handleRegenerateKey: jest.fn().mockResolvedValue(jwkPublicKey as PublicKey)
  };
});
jest.mock("@pagopa/io-react-native-login-utils", () => ({
  getRedirects: jest.fn().mockResolvedValue([undefined])
}));

describe("Lollipop regenerate key, get redirects and verification", () => {
  it("should be succeded", async () => {
    const result = await regenerateKeyGetRedirectsAndVerifySaml(
      "loginUri",
      "keyTag",
      false,
      dispatch
    );
    expect(E.isLeft(result)).toBeTruthy();
    if (E.isLeft(result)) {
      expect(result.left).toEqual(new Error("Missing SAMLRequest"));
    }
  });
});
