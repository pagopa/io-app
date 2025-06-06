import { setUseMessagePaymentInfoV2 } from "../persistedPreferences";

describe("persistedPreferences", () => {
  describe("setUseMessagePaymentInfoV2", () => {
    [false, true].forEach(payload =>
      it(`should match type and payload (${payload})`, () => {
        const action = setUseMessagePaymentInfoV2(payload);
        expect(action.type).toBe("SET_USE_MESSAGE_PAYMENT_INFO_V2");
        expect(action.payload).toBe(payload);
      })
    );
  });
});
