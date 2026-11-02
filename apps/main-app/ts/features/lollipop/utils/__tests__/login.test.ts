import { PublicKey } from "@pagopa/io-react-native-crypto";
import { getRedirects } from "@pagopa/io-react-native-login-utils";
import { err } from "neverthrow";

import { followNativeRedirectsAndVerifySaml } from "../login";

jest.mock("@pagopa/io-react-native-login-utils", () => ({
  getRedirects: jest.fn(),
  isLoginUtilsError: jest.fn().mockReturnValue(false)
}));

const publicKey: PublicKey = {
  crv: "P-256",
  kty: "EC",
  x: "uao9Cd3ecm/nHVJP05C5AycOuRq9+W/kFGUgPRB2Xic=",
  y: "ExlJCRzL4crzq05EGcAl8b6stmjYeBTkCiiRziKPWaY="
};

const authorizeUrl = "https://oneid.example.com/authorize";

describe("followNativeRedirectsAndVerifySaml", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      name: "the redirects end on the OneIdentity error page",
      redirects: [
        authorizeUrl,
        "https://oneid.example.com/login/error?error_code=GENERIC_HTML_ERROR"
      ],
      expected: {
        reason: "Missing SAMLRequest parameter in URL",
        url: "https://oneid.example.com/login/error?error_code=GENERIC_HTML_ERROR"
      }
    },
    {
      name: "SAMLRequest is missing on an ordinary URL",
      redirects: [authorizeUrl, "https://oneid.example.com/other"],
      expected: {
        reason: "Missing SAMLRequest parameter in URL",
        url: "https://oneid.example.com/other"
      }
    },
    {
      name: "no redirects are returned",
      redirects: [],
      expected: { reason: "Missing Redirects" }
    }
  ])("returns an error when $name", async ({ redirects, expected }) => {
    jest.mocked(getRedirects).mockResolvedValue(redirects);

    const result = await followNativeRedirectsAndVerifySaml(
      authorizeUrl,
      {},
      publicKey
    );

    expect(result).toEqual(err(expected));
  });

  it("returns the native failure reason without a URL", async () => {
    jest
      .mocked(getRedirects)
      .mockRejectedValue(new Error("Native redirect failed"));

    const result = await followNativeRedirectsAndVerifySaml(
      authorizeUrl,
      {},
      publicKey
    );

    expect(result).toEqual(
      err({ reason: expect.stringContaining("Native redirect failed") })
    );
  });
});
