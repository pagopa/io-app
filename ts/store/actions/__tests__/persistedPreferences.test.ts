import { preferencesAarFeatureSetEnabled } from "../persistedPreferences";

describe("persistedPreferences", () => {
  [true, false].forEach(isAarFeatureEnabled =>
    it(`Should have correct type="PREFERENCES_AAR_FEATURE_SET_ENABLED" and payload: {isAarFeatureEnabled: ${isAarFeatureEnabled}}`, () => {
      const action = preferencesAarFeatureSetEnabled({ isAarFeatureEnabled });
      expect(action.type).toBe("PREFERENCES_AAR_FEATURE_SET_ENABLED");
      expect(action.payload).toEqual({ isAarFeatureEnabled });
    })
  );
});
