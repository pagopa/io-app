import { ItwSessionExpiredError } from "../../../api/client";
import { createItwTrustmarkGuardsImplementation } from "../guards";

// Wallet Instance Attestation
const T_WIA =
  "eyJ0eXAiOiJ3YWxsZXQtYXR0ZXN0YXRpb24rand0IiwiYWxnIjoiRVMyNTYiLCJraWQiOiJjbkRpRW0zNldjdEVnSnBwNUJfazNtdzdkZ2hrNzlNc3FfbHdWT3V4aG5NIn0.eyJhYWwiOiJodHRwczovL3dhbGxldC5pby5wYWdvcGEuaXQvTG9BL2Jhc2ljIiwiYXV0aG9yaXphdGlvbl9lbmRwb2ludCI6ImV1ZGl3OiIsImNuZiI6eyJqd2siOnsiY3J2IjoiUC0yNTYiLCJraWQiOiJzOW9VSlBMbjBuMkptQVh6dW5vRGRFZVBqUzZvZW10TzNWLUdwLXBGVERRIiwia3R5IjoiRUMiLCJ4IjoiZG9JNGFybDdOTUwtUFl0dWJVVV94WndUVnFmQVBaZURjLWExSkx0SHZkdyIsInkiOiJQQXVjVEQyajFTZDl1ODdlYW9iRmxNUmFvX09SWnBCYUJha2JlS2E1Ujc4In19LCJob21lcGFnZV91cmkiOiJodHRwczovL2lvLml0YWxpYS5pdCIsImlzcyI6Imh0dHBzOi8vd2FsbGV0LmlvLnBhZ29wYS5pdCIsInByZXNlbnRhdGlvbl9kZWZpbml0aW9uX3VyaV9zdXBwb3J0ZWQiOmZhbHNlLCJyZXF1ZXN0X29iamVjdF9zaWduaW5nX2FsZ192YWx1ZXNfc3VwcG9ydGVkIjpbIkVTMjU2Il0sInJlc3BvbnNlX21vZGVzX3N1cHBvcnRlZCI6WyJmb3JtX3Bvc3Quand0Il0sInJlc3BvbnNlX3R5cGVzX3N1cHBvcnRlZCI6WyJ2cF90b2tlbiJdLCJzdWIiOiJzOW9VSlBMbjBuMkptQVh6dW5vRGRFZVBqUzZvZW10TzNWLUdwLXBGVERRIiwidnBfZm9ybWF0c19zdXBwb3J0ZWQiOnsidmMrc2Qtand0Ijp7InNkLWp3dF9hbGdfdmFsdWVzIjpbIkVTMjU2IiwiRVMyNTZLIiwiRVMzODQiLCJFUzUxMiIsIlJTMjU2IiwiUlMzODQiLCJSUzUxMiIsIlBTMjU2IiwiUFMzODQiLCJQUzUxMiJdfSwidnArc2Qtand0Ijp7InNkLWp3dF9hbGdfdmFsdWVzIjpbIkVTMjU2IiwiRVMyNTZLIiwiRVMzODQiLCJFUzUxMiIsIlJTMjU2IiwiUlMzODQiLCJSUzUxMiIsIlBTMjU2IiwiUFMzODQiLCJQUzUxMiJdfX0sImlhdCI6MTczMjAwNDU3NywiZXhwIjoxNzMyMDA4MTc3fQ.qGwZfW1_t1wRhSrpUgdowHdzvf1c-6xjDqazEfh86aD9erzqkiroNiu1R1akAvBJQwZiSqiOt_GzdqIVn5Bqbw";

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
      [true, T_WIA, 1732004577000],
      [false, T_WIA, 1732120973000]
    ])("returns %s if timestamp is %s", (expected, wia, timestamp) => {
      jest.setSystemTime(timestamp);

      const { hasValidWalletInstanceAttestation } =
        createItwTrustmarkGuardsImplementation();
      expect(
        hasValidWalletInstanceAttestation({
          context: {
            walletInstanceAttestation: wia,
            credentialType: "MDL"
          }
        })
      ).toBe(expected);
    });

    it("throws if the WIA is not valid", () => {
      const { hasValidWalletInstanceAttestation } =
        createItwTrustmarkGuardsImplementation();
      expect(() =>
        hasValidWalletInstanceAttestation({
          context: {
            walletInstanceAttestation: "not a WIA",
            credentialType: "MDL"
          }
        })
      ).toThrow();
    });
  });
});
