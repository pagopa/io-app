import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { getCredentialDocumentNumber, getCredentialTrustmark } from "..";
import { Env } from "../../../common/utils/environment";
import { getIoWallet } from "../../../common/utils/itwIoWallet";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn().mockReturnValue({
    Trustmark: {
      getCredentialTrustmark: jest.fn()
    }
  })
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
      const ioWallet = getIoWallet("1.0.0");

      jest
        .spyOn(ioWallet.Trustmark, "getCredentialTrustmark")
        .mockReturnValueOnce(
          Promise.resolve({
            jwt: "testJwt",
            expirationTime: 1000
          })
        );

      const trustmark = await getCredentialTrustmark(
        { VERIFIER_BASE_URL: "https://verifier.url" } as Env,
        "1.0.0",
        "walletInstanceAttestation",
        ItwStoredCredentialsMocks.mdl
      );

      expect(ioWallet.Trustmark.getCredentialTrustmark).toHaveBeenCalledWith({
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
