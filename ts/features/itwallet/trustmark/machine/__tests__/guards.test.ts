import { ItwSessionExpiredError } from "../../../api/client";
import { createItwTrustmarkGuardsImplementation } from "../guards";

// Wallet Instance Attestation
const T_WIA =
  "eyJ0eXAiOiJvYXV0aC1jbGllbnQtYXR0ZXN0YXRpb24rand0IiwiYWxnIjoiRVMyNTYiLCJraWQiOiI4VWtmcnZ0dExrcEFRT09wIn0.eyJhYWwiOiJodHRwczovL2ZvbzExLmJsb2IuY29yZS53aW5kb3dzLm5ldC9mb28vTG9BL2Jhc2ljIiwiY25mIjp7Imp3ayI6eyJjcnYiOiJQLTI1NiIsImtpZCI6Ii1DX1JVNjNqaDMyTDJDUFJ0MXlrcHZJdWNOMDRlVGdHWlBORnY2VlZPOUUiLCJrdHkiOiJFQyIsIngiOiJlRnJkQ0thY3I3UFhaT3pQR2hudHF1amQxYmZWX05IM1ZYeE1uRHJHNHJVIiwieSI6IjM5cXBMbGtBR0VWazA5SFlYN0Z0VnlKb1U2MTlTY3hWUVdaR2FiWUoyZWcifX0sImlzcyI6Imh0dHBzOi8vZm9vMTEuYmxvYi5jb3JlLndpbmRvd3MubmV0L2ZvbyIsInN1YiI6Ii1DX1JVNjNqaDMyTDJDUFJ0MXlrcHZJdWNOMDRlVGdHWlBORnY2VlZPOUUiLCJ3YWxsZXRfbGluayI6Imh0dHBzOi8vZm9vMTEuYmxvYi5jb3JlLndpbmRvd3MubmV0L2ZvbyIsIndhbGxldF9uYW1lIjoiSVQgV2FsbGV0IiwiaWF0IjoxNzU2NzEwOTM3LCJleHAiOjE3NTY3MTQ1Mzd9.7J_e6lusZXIQtji-6fr2NQFIX4voxALbL7SKMqcVdzkhz9kk-_5iYK0S__VOwV1H9VZQKnHVhX2FqJhkt1Itjg";

describe("itwTrustmarkMachine guards", () => {
  describe("isSessionExpired", () => {
    it.each([
      [true, new ItwSessionExpiredError()],
      [false, new Error()]
    ])("returns %s if the error is %s", (expected, error) => {
      const { isSessionExpired } = createItwTrustmarkGuardsImplementation();
      expect(isSessionExpired({ event: { error, type: "error" } })).toBe(
        expected
      );
    });
  });

  describe("hasValidWalletInstanceAttestation", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it.each([
      [true, T_WIA, 1756710937000],
      [false, T_WIA, 1756814537000]
    ])("returns %s if timestamp is %s", (expected, wia, timestamp) => {
      jest.setSystemTime(timestamp);

      const { hasValidWalletInstanceAttestation } =
        createItwTrustmarkGuardsImplementation();
      expect(
        hasValidWalletInstanceAttestation({
          context: {
            walletInstanceAttestation: { jwt: wia },
            credentialType: "mDL"
          }
        })
      ).toBe(expected);
    });

    it("returns false if the WIA is not valid", () => {
      const { hasValidWalletInstanceAttestation } =
        createItwTrustmarkGuardsImplementation();
      expect(
        hasValidWalletInstanceAttestation({
          context: {
            walletInstanceAttestation: { jwt: "not a WIA" },
            credentialType: "mDL"
          }
        })
      ).toEqual(false);
    });
  });
});
