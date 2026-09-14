import { persistedDismissFseDiscoveryBanner } from "..";

describe("persistedDismissFseDiscoveryBanner", () => {
  it("should create a dismiss banner action", () => {
    expect(persistedDismissFseDiscoveryBanner()).toEqual({
      type: "FSE_DISCOVERY_BANNER_DISMISS"
    });
  });
});
