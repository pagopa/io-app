import * as pot from "@pagopa/ts-commons/lib/pot";
import { testable } from "../configureStoreAndPersistor";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../common/model/RemoteValue";

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

describe("configureStoreAndPersistor", () => {
  describe("CURRENT_REDUX_STORE_VERSION", () => {
    it("should match expected value", () => {
      const version = testable!.CURRENT_REDUX_STORE_VERSION;
      expect(version).toBe(49);
    });
  });
  describe("migrations", () => {
    it("should not have a migration which version is major than CURRENT_REDUX_STORE_VERSION", () => {
      const migrations = testable!.migrations;
      const expectedMaxVersion = testable!.CURRENT_REDUX_STORE_VERSION;
      const nextMigration = migrations[expectedMaxVersion + 1];
      expect(nextMigration).toBeUndefined();
    });
    // Test for 41 to 42
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
    // Test for 42 to 43
    [
      remoteUndefined,
      remoteLoading,
      remoteReady({
        items: [
          {
            id: "An ID 1",
            name: "A name 1",
            logo: "aLogoUrl 1",
            profileUrl: "aProfileUrl 1"
          },
          {
            id: "An ID 2",
            name: "A name 2",
            logo: "aLogoUrl 2",
            profileUrl: "aProfileUrl 2",
            isTestIdp: false
          },
          {
            id: "An ID 2",
            name: "A name 2",
            logo: "aLogoUrl 2",
            profileUrl: "aProfileUrl 2",
            isTestIdp: true
          },
          {
            id: "",
            name: "",
            logo: "",
            profileUrl: ""
          }
        ]
      }),
      remoteError(Error("An error"))
    ].forEach(legacyIdps => {
      const expectedConvertedIdps = isReady(legacyIdps)
        ? remoteReady([
            {
              id: "An ID 1",
              name: "A name 1",
              logo: { light: { uri: "aLogoUrl 1" }, dark: undefined },
              profileUrl: "aProfileUrl 1",
              isTestIdp: undefined
            },
            {
              id: "An ID 2",
              name: "A name 2",
              logo: { light: { uri: "aLogoUrl 2" }, dark: undefined },
              profileUrl: "aProfileUrl 2",
              isTestIdp: false
            },
            {
              id: "An ID 2",
              name: "A name 2",
              logo: { light: { uri: "aLogoUrl 2" }, dark: undefined },
              profileUrl: "aProfileUrl 2",
              isTestIdp: true
            },
            {
              id: "",
              name: "",
              logo: { light: { uri: "" }, dark: undefined },
              profileUrl: "",
              isTestIdp: undefined
            }
          ])
        : legacyIdps;
      it(`should migrate from 42 to 43 for idps value of remote_${legacyIdps.kind}`, () => {
        const basePersistedGlobalStateAt42 = {
          content: {
            municipality: {
              codiceCatastale: pot.none,
              data: pot.none
            },
            contextualHelp: pot.none
          },
          crossSessions: {
            hashedFiscalCode:
              "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
          },
          installation: {
            isFirstRunAfterInstall: false,
            appVersionHistory: [
              "2.78.0.11",
              "2.79.0.9",
              "2.80.0.9",
              "2.81.0.8",
              "2.81.1.1",
              "2.82.0.7",
              "2.83.0.7",
              "3.0.0.7",
              "3.0.1.0",
              "3.1.0.0"
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
            fontPreference: "comfortable",
            isExperimentalDesignEnabled: false
          },
          profile: pot.none,
          _persist: {
            version: 42,
            rehydrated: false
          }
        };
        const persistedStateAt42 = {
          ...basePersistedGlobalStateAt42,
          content: {
            ...basePersistedGlobalStateAt42.content,
            idps: legacyIdps
          }
        };
        const from42To43Migration = testable!.migrations[43];
        expect(from42To43Migration).toBeDefined();
        const globalStateAt42 = from42To43Migration(persistedStateAt42);
        expect(globalStateAt42).toEqual({
          ...basePersistedGlobalStateAt42,
          content: {
            ...basePersistedGlobalStateAt42.content,
            idps: expectedConvertedIdps
          }
        });
      });
    });
    // Test for 43 to 44
    it("should migrate from 43 to 44", () => {
      const basePersistedGlobalStateAt43 = {
        content: {
          idps: remoteUndefined,
          municipality: {
            codiceCatastale: pot.none,
            data: pot.none
          },
          contextualHelp: pot.none
        },
        crossSessions: {
          hashedFiscalCode:
            "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
        },
        installation: {
          isFirstRunAfterInstall: false,
          appVersionHistory: [
            "2.81.0.8",
            "2.81.1.1",
            "2.82.0.7",
            "2.83.0.7",
            "3.0.0.8",
            "3.1.0.2",
            "3.2.0.8",
            "3.3.0.8",
            "3.4.0.5",
            "3.5.0.8"
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
          fontPreference: "comfortable",
          isExperimentalDesignEnabled: false
        },
        profile: pot.none,
        _persist: {
          version: 43,
          rehydrated: false
        }
      };
      const persistedStateAt43 = {
        ...basePersistedGlobalStateAt43,
        persistedPreferences: {
          ...basePersistedGlobalStateAt43.persistedPreferences,
          isItwOfflineAccessEnabled: true
        }
      };

      const from43To44Migration = testable!.migrations[44];
      expect(from43To44Migration).toBeDefined();
      const nextState = from43To44Migration(persistedStateAt43);

      expect(nextState).toStrictEqual(basePersistedGlobalStateAt43);
    });
    // Test for 44 to 45
    it("should migrate from 44 to 45", () => {
      const persistedStateAt44 = {
        content: {
          idps: remoteUndefined,
          municipality: {
            codiceCatastale: pot.none,
            data: pot.none
          },
          contextualHelp: pot.none
        },
        crossSessions: {
          hashedFiscalCode:
            "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
        },
        installation: {
          isFirstRunAfterInstall: false,
          appVersionHistory: [
            "2.82.0.7",
            "2.83.0.7",
            "3.0.0.8",
            "3.0.1.0",
            "3.1.0.2",
            "3.2.0.8",
            "3.3.0.8",
            "3.4.0.5",
            "3.5.0.8",
            "3.6.0.9"
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
          fontPreference: "comfortable",
          isExperimentalDesignEnabled: false
        },
        profile: pot.none,
        _persist: {
          version: 44,
          rehydrated: false
        }
      };
      const from44To45Migration = testable!.migrations[45];
      expect(from44To45Migration).toBeDefined();
      const globalStateAt45 = from44To45Migration(persistedStateAt44);
      expect(globalStateAt45).toEqual({
        ...persistedStateAt44,
        persistedPreferences: {
          ...persistedStateAt44.persistedPreferences,
          useMessagePaymentInfoV2: false
        }
      });
    });
    // Test for 45 to 46
    [false, true].forEach(useV2ForMessagePayments =>
      it(`should migrate from 45 to 46 (use V2 for message's payments ${useV2ForMessagePayments})`, () => {
        const basePersistedGlobalStateAt45 = {
          content: {
            idps: remoteUndefined,
            municipality: {
              codiceCatastale: pot.none,
              data: pot.none
            },
            contextualHelp: pot.none
          },
          crossSessions: {
            hashedFiscalCode:
              "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
          },
          installation: {
            isFirstRunAfterInstall: false,
            appVersionHistory: [
              "2.83.0.7",
              "3.0.0.8",
              "3.0.1.0",
              "3.1.0.2",
              "3.2.0.8",
              "3.3.0.8",
              "3.4.0.5",
              "3.5.0.8",
              "3.6.0.9",
              "3.7.0.7"
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
            fontPreference: "comfortable",
            isExperimentalDesignEnabled: false
          },
          profile: pot.none,
          _persist: {
            version: 45,
            rehydrated: false
          }
        };
        const persistedStateAt45 = {
          ...basePersistedGlobalStateAt45,
          persistedPreferences: {
            ...basePersistedGlobalStateAt45.persistedPreferences,
            useMessagePaymentInfoV2: useV2ForMessagePayments
          }
        };
        const from45To46Migration = testable!.migrations[46];
        expect(from45To46Migration).toBeDefined();
        const globalStateAt46 = from45To46Migration(persistedStateAt45);
        expect(globalStateAt46).toEqual(basePersistedGlobalStateAt45);
      })
    );
    // Test for 46 to 47
    it("should migrate from 46 to 47", () => {
      const persistedStateAt46 = {
        content: {
          idps: remoteUndefined,
          municipality: {
            codiceCatastale: pot.none,
            data: pot.none
          },
          contextualHelp: pot.none
        },
        crossSessions: {
          hashedFiscalCode:
            "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
        },
        installation: {
          isFirstRunAfterInstall: false,
          appVersionHistory: [
            "3.3.0.8",
            "3.4.0.5",
            "3.5.0.8",
            "3.6.0.9",
            "3.7.0.7",
            "3.8.0.9",
            "3.9.0.6",
            "3.10.0.6",
            "3.11.0.4",
            "3.12.0.7"
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
          fontPreference: "comfortable",
          isExperimentalDesignEnabled: false
        },
        profile: pot.none,
        _persist: {
          version: 46,
          rehydrated: false
        }
      };
      const from46To47Migration = testable!.migrations[47];
      expect(from46To47Migration).toBeDefined();
      const globalStateAt47 = from46To47Migration(persistedStateAt46);
      expect(globalStateAt47).toEqual({
        ...persistedStateAt46,
        persistedPreferences: {
          ...persistedStateAt46.persistedPreferences,
          isAarFeatureEnabled: false
        }
      });
    });
    // Test for 47 to 48
    it("should migrate from 47 to 48", () => {
      const persistedStateAt47 = {
        content: {
          idps: remoteUndefined,
          municipality: {
            codiceCatastale: pot.none,
            data: pot.none
          },
          contextualHelp: pot.none
        },
        crossSessions: {
          hashedFiscalCode:
            "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
        },
        installation: {
          isFirstRunAfterInstall: false,
          appVersionHistory: [
            "3.3.0.8",
            "3.4.0.5",
            "3.5.0.8",
            "3.6.0.9",
            "3.7.0.7",
            "3.8.0.9",
            "3.9.0.6",
            "3.10.0.6",
            "3.11.0.4",
            "3.12.0.7"
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
          fontPreference: "comfortable",
          isExperimentalDesignEnabled: false,
          isAarFeatureEnabled: false
        },
        profile: pot.none,
        _persist: {
          version: 47,
          rehydrated: false
        }
      };
      const from47To48Migration = testable!.migrations[48];
      expect(from47To48Migration).toBeDefined();
      const globalStateAt48 = from47To48Migration(persistedStateAt47);
      expect(globalStateAt48).toEqual({
        ...persistedStateAt47,
        persistedPreferences: {
          ...persistedStateAt47.persistedPreferences,
          themePreference: "light"
        }
      });
    });
    // Test for 48 to 49
    [false, true].forEach(isAarFeatureEnabled =>
      it(`should migrate from 48 to 49 (is AAR feature enabled: ${isAarFeatureEnabled})`, () => {
        const basePersistedGlobalStateAt48 = {
          content: {
            idps: remoteUndefined,
            municipality: {
              codiceCatastale: pot.none,
              data: pot.none
            },
            contextualHelp: pot.none
          },
          crossSessions: {
            hashedFiscalCode:
              "6494e783ad296f016b2105f8fe7dc2979551a37d3a5c40624e2ee8eee64e8017"
          },
          installation: {
            isFirstRunAfterInstall: false,
            appVersionHistory: [
              "3.8.0.9",
              "3.9.0.6",
              "3.10.0.6",
              "3.11.0.4",
              "3.12.0.7",
              "3.13.0.10",
              "3.14.0.3",
              "3.15.0.3",
              "3.16.0.7",
              "3.17.0.8"
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
            fontPreference: "comfortable",
            isExperimentalDesignEnabled: false,
            themePreference: "light"
          },
          profile: pot.none,
          _persist: {
            version: 48,
            rehydrated: false
          }
        };
        const persistedStateAt48 = {
          ...basePersistedGlobalStateAt48,
          persistedPreferences: {
            ...basePersistedGlobalStateAt48.persistedPreferences,
            isAarFeatureEnabled
          }
        };
        const from48To49Migration = testable!.migrations[49];
        expect(from48To49Migration).toBeDefined();
        const globalStateAt49 = from48To49Migration(persistedStateAt48);
        expect(globalStateAt49).toEqual(basePersistedGlobalStateAt48);
      })
    );
  });
});
