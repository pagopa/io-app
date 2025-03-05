import * as pot from "@pagopa/ts-commons/lib/pot";
import { testable } from "../configureStoreAndPersistor";

jest.mock("redux-persist", () => ({
  createMigrate: jest.fn(),
  createTransform: jest.fn(),
  persistReducer: (_: any, reducer: any) => reducer,
  persistStore: jest.fn()
}));

jest.mock("redux-saga", () => {
  const fn = () => () => undefined;
  // eslint-disable-next-line functional/immutable-data
  fn.run = () => undefined;
  return () => fn;
});

jest.mock("react-native-i18n", () => ({
  t: (key: string) => key
}));

describe("configureStoreAndPersistor", () => {
  describe("CURRENT_REDUX_STORE_VERSION", () => {
    it("should match expected value", () => {
      const version = testable!.CURRENT_REDUX_STORE_VERSION;
      expect(version).toBe(42);
    });
  });
  describe("migrations", () => {
    it("should not have a migration which version is major than CURRENT_REDUX_STORE_VERSION", () => {
      const migrations = testable!.migrations;
      const expectedMaxVersion = testable!.CURRENT_REDUX_STORE_VERSION;
      const nextMigration = migrations[expectedMaxVersion + 1];
      expect(nextMigration).toBeUndefined();
    });
    [false, true].forEach(dsEnabled =>
      [false, true].forEach(markdownEnabled =>
        it(`should migrate from 41 to 42 (isDesignSystemEnabled: ${dsEnabled}, isIOMarkdownEnabledOnMessagesAndServices: ${markdownEnabled})`, () => {
          const basePersistedPreferencesAt41 = {
            isFingerprintEnabled: undefined,
            preferredCalendar: undefined,
            preferredLanguage: undefined,
            wasServiceAlertDisplayedOnce: false,
            isPagoPATestEnabled: false,
            isCustomEmailChannelEnabled: pot.none,
            continueWithRootOrJailbreak: false,
            isMixpanelEnabled: null,
            isPnTestEnabled: false,
            isIdPayTestEnabled: false,
            isItwOfflineAccessEnabled: false,
            fontPreference: "comfortable"
          };
          const globalStateAt41 = {
            // Other properties have been omitted for brevity
            persistedPreferences: {
              ...basePersistedPreferencesAt41,
              isDesignSystemEnabled: dsEnabled,
              isIOMarkdownEnabledOnMessagesAndServices: markdownEnabled
            },
            _persist: {
              version: 41,
              rehydrated: false
            }
          };
          const from41To42Migration = testable!.migrations[42];
          expect(from41To42Migration).toBeDefined();
          const globalStateAt42 = from41To42Migration(globalStateAt41);
          expect(globalStateAt42).toEqual({
            persistedPreferences: {
              ...basePersistedPreferencesAt41,
              isExperimentalDesignEnabled: dsEnabled
            },
            _persist: {
              version: 41,
              rehydrated: false
            }
          });
        })
      )
    );
  });
});
