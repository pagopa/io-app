import * as pot from "@pagopa/ts-commons/lib/pot";
import { testable } from "../configureStoreAndPersistor";
import { remoteUndefined } from "../../common/model/RemoteValue";

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
          const basePersistedGlobalStateAt41 = {
            content: {
              municipality: {
                codiceCatastale: pot.none,
                data: pot.none
              },
              contextualHelp: pot.none,
              idps: remoteUndefined
            },
            crossSessions: {
              hashedFiscalCode:
                "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
            },
            installation: {
              isFirstRunAfterInstall: false,
              appVersionHistory: [
                "2.77.0.3",
                "2.77.1.0",
                "2.78.0.11",
                "2.79.0.9",
                "2.80.0.9",
                "2.81.0.8",
                "2.81.1.1",
                "2.82.0.7",
                "2.83.0.7",
                "3.0.0.7"
              ]
            },
            onboarding: {
              isFingerprintAcknowledged: false
            },
            persistedPreferences: {
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
            },
            profile: pot.none,
            _persist: {
              version: 41,
              rehydrated: false
            }
          };
          const persistedStateAt41 = {
            ...basePersistedGlobalStateAt41,
            persistedPreferences: {
              ...basePersistedGlobalStateAt41.persistedPreferences,
              isDesignSystemEnabled: dsEnabled,
              isIOMarkdownEnabledOnMessagesAndServices: markdownEnabled
            }
          };
          const from41To42Migration = testable!.migrations[42];
          expect(from41To42Migration).toBeDefined();
          const globalStateAt42 = from41To42Migration(persistedStateAt41);
          expect(globalStateAt42).toEqual({
            ...basePersistedGlobalStateAt41,
            persistedPreferences: {
              ...basePersistedGlobalStateAt41.persistedPreferences,
              isExperimentalDesignEnabled: dsEnabled
            }
          });
        })
      )
    );
  });
});
