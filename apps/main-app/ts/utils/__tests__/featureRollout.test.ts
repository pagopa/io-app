import { isFeatureEnabled } from "../featureRollout";

describe("featureRollout", () => {
  describe("isFeatureEnabled", () => {
    it("should return false when rolloutPercentage is 0 or less", () => {
      expect(isFeatureEnabled("device-1", 0, "TestFeature")).toBe(false);
      expect(isFeatureEnabled("device-1", -10, "TestFeature")).toBe(false);
    });

    it("should return true when rolloutPercentage is 100 or more", () => {
      expect(isFeatureEnabled("device-1", 100, "TestFeature")).toBe(true);
      expect(isFeatureEnabled("device-1", 150, "TestFeature")).toBe(true);
    });

    it("should be deterministic for the same deviceId/rolloutPercentage/featureName", () => {
      const first = isFeatureEnabled("device-1", 50, "TestFeature");
      const second = isFeatureEnabled("device-1", 50, "TestFeature");
      expect(first).toBe(second);
    });

    it("should be monotonically increasing: raising the rollout percentage never disables a device that was enabled", () => {
      const deviceIds = Array.from({ length: 200 }, (_, i) => `device-${i}`);
      const enabledAt30 = deviceIds.filter(id =>
        isFeatureEnabled(id, 30, "TestFeature")
      );
      const enabledAt70 = deviceIds.filter(id =>
        isFeatureEnabled(id, 70, "TestFeature")
      );
      enabledAt30.forEach(id => expect(enabledAt70).toContain(id));
    });
  });
});
