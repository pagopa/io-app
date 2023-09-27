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

const url =
  "https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/Redirect/SSO?SAMLRequest=nVRdb9owFH3vr7D8ng%2FCwiqLUDFoOyY2GGGrujeTXMrVEtu1nYb2189JgSFtoxpPsXxvzjn3HNv9q21ZkCfQBqVIaMcP6dXgom94WSg2rOxGLOCxAmOJ6xOGtYWEVlowyQ0aJngJhtmMpcPPUxb5IVNaWpnJgpLJOKFmw6O456k6jEfh4%2BaF1xuj0nKaXvLJ3W18fXNnvVE1%2B%2FSOx9f3UR3d3lPyfS%2FHwTkUYyqYCGO5sG4rjLpeGHudy2X4noU91o38Ti%2F%2BQcl8x%2FsBRY7i4bTI1WuTYR%2BXy7k3n6VLSsZuTBTcttQba5VhQYC5Ae388ZsPvmCG4KOwoIX0H%2BSTj9a1qMANvcYCgoYgChaQo4bMBmk6o%2BRG6gxaLxNqdQWUDI1Da3hGUpiqBJ024Bl8W0x%2FM3OlvBXPfoLIfZSOiBfIGz7%2Bj78drrUaV5WF14obcFeaiBy2CQ3p4IKQNl3W2qqPYj1t2IGUki%2Bu%2BLVyatYI%2Bm29rQElt6fxmx3MvXXbykBYtM908BZ2Pzia5TCbYo3EyXguC8yezzm5%2F6%2FYai4MOt00ONKxuzyQt%2FG7VCxsz7pKI1kqrtE0R9PlimVVtlnu0zzGHxUurAWsz8j2YHhd175RmO%2FPeOrW0%2B7O7r%2BRtUMHJ6Z2r0rw57My%2BAU%3D&SigAlg=http%3A%2F%2Fwww.w3.org%2F2001%2F04%2Fxmldsig-more%23rsa-sha256&Signature=OjuiO%2F5RaWmukcYtwOQ0kREGH%2FjH6NBsDk2eCCMVNzublb5p0Bi%2BWeWQWpltvWeDgWwvRtZu9P2Qp0nWEXQ%2Fd88tZuz5zanmqsXW7BzI66PFtEQbygxNPwidhHsxRPs%2FMrCBidNd8INSUhW39zE6ngwVEcGX81QryNBfKu6%2B4TTdAYmL4gpERseSmK%2F9cXdrxbeRZTC691kZCvYi6jk0pFbHqHe7LLA25eWs1S7LKeY1I%2F3Cd4Vjyso0COdrZl%2FjewJpGFy7f2DFeV%2F3KrOCSjolWQIcMLZxE03ybzQAFFJVFIC70MWPzrnA7JLepz9fSOlDANEt59KGU6o7iSunRo0%2FuhTwFZFMHqo1%2FLxAEfVUl2%2FuGyAOoCvGC53B4Bo1FiB9pJh4A1FimcUFhOV4sp5Lk%2F9sbQBeTw14LzFFgNQ4yzaSlOZGOaKV2ayl%2FcMTTlJW9hw6DPPZ1M98n5zuuRXG3EyoKVWj6YLy5NXiaJqcdt3bogVC0LKXKInXQJvN0GDqtRNkXFnVIUdeRRx30wYXeWPoilqawAR1ZoR0uw9IqoY%2F5ZzgtbKnxkrduMnvTsgwcLUXnDecty9L81duCUBnp9LGaQB%2BWJkbVAKhRaskNfIbgFtQK8cDnYlmJFNMD4s%2BfkDZ%2BOJ6aSyOhuO9%2BDGtSLXrMxk0va8rlUjyCwU%3D";

const dispatch: AppDispatch = jest.fn();
jest.mock("../..", () => {
  const actualModule = jest.requireActual("../..");
  return {
    ...actualModule,
    handleRegenerateKey: jest.fn().mockResolvedValue(jwkPublicKey as PublicKey)
  };
});
jest.mock("@pagopa/io-react-native-login-utils", () => ({
  getRedirects: jest.fn().mockResolvedValue([url])
}));

describe("Lollipop regenerate key, get redirects and verification", () => {
  it("should be succeded", async () => {
    const result = await regenerateKeyGetRedirectsAndVerifySaml(
      "loginUri",
      "keyTag",
      false,
      false,
      dispatch
    );
    expect(E.isRight(result)).toBeTruthy();
  });
});
