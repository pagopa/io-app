import { PublicKey } from "@pagopa/io-react-native-crypto";
import { getRedirects } from "@pagopa/io-react-native-login-utils";
import { err } from "neverthrow";

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
  getRedirects: jest.fn()
}));

describe("Lollipop regenerate key, get redirects and verification", () => {
  it.each([
    {
      name: "no redirects are returned",
      redirects: [],
      expectedError: { reason: "Missing Redirects" }
    },
    {
      name: "the last redirect has no SAMLRequest",
      redirects: ["https://idp.example.com/sso"],
      expectedError: {
        reason: "Missing SAMLRequest parameter in URL",
        url: "https://idp.example.com/sso"
      }
    }
  ])("should fail when $name", async ({ redirects, expectedError }) => {
    jest.mocked(getRedirects).mockResolvedValue(redirects);

    const result = await regenerateKeyGetRedirectsAndVerifySaml(
      "loginUri",
      "keyTag",
      false,
      false,
      dispatch
    );

    expect(result).toEqual(err(expectedError));
  });
});
