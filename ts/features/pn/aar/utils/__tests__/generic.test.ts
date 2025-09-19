import { isSendAARPhase2Enabled } from "../generic";

describe("generic AAR utils", () => {
  it("sendAARPhase2Enabled should return false", () => {
    const isEnabled = isSendAARPhase2Enabled();
    expect(isEnabled).toBe(false);
  });
});
