import { setIsMixpanelInitialized } from "..";

describe("index", () => {
  describe("setIsMixpanelInitialized", () => {
    [false, true].forEach(isInitialized =>
      it(`should create action with proper event name and payload (${isInitialized})`, () => {
        const action = setIsMixpanelInitialized(isInitialized);
        expect(action.type).toBe("SET_IS_MIXPANEL_INITIALIZED");
        expect(action.payload).toBe(isInitialized);
      })
    );
  });
});
