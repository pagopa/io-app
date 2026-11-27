import { PublicKey } from "@io-app/expo-crypto";
import { getRedirects } from "@io-app/login-utils";
import { err } from "neverthrow";

import { AppDispatch } from "../../../../App";
import { toRedirectsFailureReason } from "../../../authentication/common/utils/loginFailure";
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
jest.mock("@io-app/login-utils", () => ({
  getRedirects: jest.fn().mockResolvedValue([undefined])
}));

describe("Lollipop regenerate key, get redirects and verification", () => {
  it.each([
    {
      name: "no redirects are returned",
      redirects: [],
      expectedReason: "Missing Redirects",
      expectedUrl: "loginUri"
    },
    {
      name: "the last redirect has no SAMLRequest",
      redirects: ["https://idp.example.com/sso"],
      expectedReason: "Missing SAMLRequest parameter in URL",
      expectedUrl: "https://idp.example.com/sso"
    }
  ])(
    "should fail when $name",
    async ({ redirects, expectedReason, expectedUrl }) => {
      jest.mocked(getRedirects).mockResolvedValue(redirects);

      const result = await regenerateKeyGetRedirectsAndVerifySaml(
        "loginUri",
        "keyTag",
        false,
        false,
        dispatch
      );

      expect(result).toEqual(
        err({
          kind: "nativeRedirects",
          details: { reason: expectedReason, url: expectedUrl }
        })
      );
      expect(result.isErr() && toRedirectsFailureReason(result.error)).toBe(
        expectedReason
      );
    }
  );
});
