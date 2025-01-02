import { Credential } from "@pagopa/io-react-native-wallet";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { getCredentialDocumentNumber, getCredentialTrustmark } from "..";

jest.mock("@pagopa/io-react-native-wallet", () => ({
  ...jest.requireActual("@pagopa/io-react-native-wallet"),
  Credential: {
    Trustmark: {
      getCredentialTrustmark: jest.fn()
    }
  }
}));

describe("ITW trustmark utils", () => {
  describe("getCredentialDocumentNumber", () => {
    it.each([
      ["MDL", ItwStoredCredentialsMocks.mdl, "RM8375131N"],
      ["DC", ItwStoredCredentialsMocks.dc, "10008581"],
      ["EID", ItwStoredCredentialsMocks.eid, undefined],
      ["TS", ItwStoredCredentialsMocks.ts, undefined]
    ])(
      "should return the document number for %s",
      (_, { parsedCredential }, expected) => {
        expect(getCredentialDocumentNumber(parsedCredential)).toBe(expected);
      }
    );
  });

  describe("getCredentialTrustmark", () => {
    it("should return the trustmark", async () => {
      jest
        .spyOn(Credential.Trustmark, "getCredentialTrustmark")
        .mockReturnValueOnce(
          Promise.resolve({
            jwt: "testJwt",
            expirationTime: 1000
          })
        );

      const trustmark = await getCredentialTrustmark(
        "walletInstanceAttestation",
        ItwStoredCredentialsMocks.mdl,
        "https://verifier.url"
      );

      expect(Credential.Trustmark.getCredentialTrustmark).toHaveBeenCalledWith({
        walletInstanceAttestation: "walletInstanceAttestation",
        wiaCryptoContext: expect.any(Object),
        credentialType: "MDL",
        docNumber: "RM8375131N"
      });

      expect(trustmark).toStrictEqual({
        jwt: "testJwt",
        expirationTime: 1000,
        url: "https://verifier.url?tm=testJwt"
      });
    });
  });
});
