import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { PersistPartial, PersistedState } from "redux-persist";
import { applicationChangeState } from "../../../../../store/actions/application";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { GlobalState } from "../../../../../store/reducers/types";
import { SessionToken } from "../../../../../types/SessionToken";
import {
  loginSuccess,
  logoutSuccess
} from "../../../../authentication/common/store/actions";
import { dismissPnActivationReminderBanner } from "../../../store/actions";
import * as bannerDismiss from "../bannerDismiss";
import { ServicesState } from "../../../../services/common/store/reducers";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

type PnBannerDismissState = bannerDismiss.PnBannerDismissState & PersistPartial;

const nonDismissedState: PnBannerDismissState = {
  dismissed: false,
  _persist: {
    version: -1,
    rehydrated: false
  }
};

const { persistedPnBannerDismissReducer, testable } = bannerDismiss;

const pnServiceId = "01G40DWQGKY5GRWSNM4303VNRP" as ServiceId;

describe("persistedPnBannerDismissReducer", () => {
  describe("migrations", () => {
    it("should match the expected persistance version, and not have any higher-version migrations", () => {
      const expectedVersion = testable!.CURRENT_STORE_VERSION;
      expect(expectedVersion).toBe(0);
      expect(testable!.migrations[expectedVersion + 1]).toBeUndefined();
    });

    it("should correctly apply the first migration", () => {
      const state = {
        dismissed: true,
        _persist: {
          version: -1,
          rehydrated: false
        }
      } as PersistedState;

      const firstMigration = testable!.migrations[0];
      expect(firstMigration).toBeDefined();
      const migratedState = firstMigration(state);
      expect(migratedState).toEqual({
        ...state,
        dismissed: false
      });
    });
  });

  it("should match snapshot [if this test fails, remember to add a migration to the store before updating the snapshot]", () => {
    const state = persistedPnBannerDismissReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(state).toMatchSnapshot();
  });

  it("should correctly dismiss on dismiss action", () => {
    const action = dismissPnActivationReminderBanner();
    const state = persistedPnBannerDismissReducer(nonDismissedState, action);
    expect(state.dismissed).toEqual(true);
  });

  it("should not change state for unhandled action types", () => {
    const action = { type: "SOME_OTHER_ACTION" };
    // @ts-expect-error: action type is not supported
    const state = persistedPnBannerDismissReducer(nonDismissedState, action);
    expect(state).toEqual(nonDismissedState);
  });
  const testCases = [true, false]
    .map(isSameUser =>
      [true, false].map(hasBeenDismissed => ({
        isSameUser,
        hasBeenDismissed,
        result: isSameUser ? hasBeenDismissed : false
      }))
    )
    .flat();

  testCases.forEach(({ isSameUser, hasBeenDismissed, result }) => {
    it(`should ${
      isSameUser ? "not " : ""
    }reset state on login, after the banner has ${
      hasBeenDismissed ? "" : "not "
    }been dismissed`, () => {
      const store = createStore(persistedPnBannerDismissReducer);
      if (hasBeenDismissed) {
        store.dispatch(dismissPnActivationReminderBanner());
      }
      expect(store.getState()).toEqual({ dismissed: hasBeenDismissed });

      store.dispatch(logoutSuccess());

      store.dispatch(
        loginSuccess({
          token: "" as SessionToken,
          idp: "test"
        })
      );

      if (!isSameUser) {
        store.dispatch(differentProfileLoggedIn());
      }

      expect(store.getState()).toEqual({ dismissed: result });
    });
  });
});

describe("isPnServiceEnabled", () => {
  it("should return 'undefined' when remoteConfig is 'O.none'", () => {
    jest.resetAllMocks();
    const state = {
      features: {
        services: {
          details: {
            preferencesById: {
              [pnServiceId]: pot.some({
                kind: "success",
                value: {
                  inbox: true
                }
              })
            }
          }
        } as unknown as ServicesState
      },
      remoteConfig: O.none
    } as GlobalState;
    const output = bannerDismiss.isPnServiceEnabled(state);
    expect(output).toBeUndefined();
  });
  it("should return 'undefined' when remoteConfig is 'O.some' with no 'notificationServiceId'", () => {
    jest.resetAllMocks();
    const state = {
      features: {
        services: {
          details: {
            preferencesById: {
              [pnServiceId]: pot.some({
                kind: "success",
                value: {
                  inbox: true
                }
              })
            }
          }
        } as unknown as ServicesState
      },
      remoteConfig: O.some({
        pn: {}
      })
    } as GlobalState;
    const output = bannerDismiss.isPnServiceEnabled(state);
    expect(output).toBeUndefined();
  });
  it("should return 'undefined' when remoteConfig is configured but there are no preferences for the service", () => {
    jest.resetAllMocks();
    const state = {
      features: {
        services: {
          details: {
            preferencesById: {}
          }
        }
      },
      remoteConfig: O.some({
        pn: {
          notificationServiceId: pnServiceId
        }
      })
    } as GlobalState;
    const output = bannerDismiss.isPnServiceEnabled(state);
    expect(output).toBeUndefined();
  });
  const servicePreferencesError = {
    id: pnServiceId,
    kind: "generic",
    value: Error("An error")
  };
  const servicePreferencesGenerator = (inbox: boolean) => ({
    kind: "success",
    value: {
      inbox
    }
  });
  (
    [
      [pot.none, undefined],
      [pot.noneLoading, undefined],
      [pot.noneUpdating(servicePreferencesGenerator(true)), undefined],
      [pot.noneError(servicePreferencesError), undefined],
      [pot.some(servicePreferencesGenerator(false)), false],
      [pot.some(servicePreferencesGenerator(true)), true],
      [pot.some({ kind: "conflictingVersion" }), undefined],
      [pot.some({ kind: "notFound" }), undefined],
      [pot.some({ kind: "tooManyRequests" }), undefined],
      [pot.someLoading(servicePreferencesGenerator(false)), false],
      [pot.someLoading(servicePreferencesGenerator(true)), true],
      [
        pot.someUpdating(
          servicePreferencesGenerator(false),
          servicePreferencesGenerator(false)
        ),
        false
      ],
      [
        pot.someUpdating(
          servicePreferencesGenerator(false),
          servicePreferencesGenerator(true)
        ),
        false
      ],
      [
        pot.someUpdating(
          servicePreferencesGenerator(true),
          servicePreferencesGenerator(false)
        ),
        true
      ],
      [
        pot.someUpdating(
          servicePreferencesGenerator(true),
          servicePreferencesGenerator(true)
        ),
        true
      ],
      [
        pot.someError(
          servicePreferencesGenerator(false),
          servicePreferencesError
        ),
        false
      ],
      [
        pot.someError(
          servicePreferencesGenerator(true),
          servicePreferencesError
        ),
        true
      ]
    ] as const
  ).forEach(([servicePreference, expectedOutput]) => {
    it(`should return '${expectedOutput}' when remoteConfig is configured and the service preference is '${JSON.stringify(
      servicePreference
    )}'`, () => {
      jest.resetAllMocks();
      const state = {
        features: {
          services: {
            details: {
              preferencesById: {
                [pnServiceId]: servicePreference
              }
            }
          } as unknown as ServicesState
        },
        remoteConfig: O.some({
          pn: {
            notificationServiceId: pnServiceId
          }
        })
      } as GlobalState;
      const output = bannerDismiss.isPnServiceEnabled(state);
      expect(output).toBe(expectedOutput);
    });
  });
});

describe("isPnActivationReminderBannerRenderableSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [true, false]
    .map(hasBeenDismissed =>
      [true, false].map(isRemoteEnabled =>
        [true, false].map(isInboxEnabled => ({
          hasBeenDismissed,
          isRemoteEnabled,
          isInboxEnabled,
          result: isRemoteEnabled && !hasBeenDismissed && !isInboxEnabled
        }))
      )
    )
    .flat()
    .flat();

  test.each(testCases)(
    "handles the following case: %p",
    ({ hasBeenDismissed, isRemoteEnabled, isInboxEnabled, result }) => {
      const state = {
        features: {
          pn: {
            bannerDismiss: {
              ...nonDismissedState,
              dismissed: hasBeenDismissed
            }
          },
          services: {
            details: {
              preferencesById: {
                [pnServiceId]: pot.some({
                  kind: "success",
                  value: {
                    inbox: isInboxEnabled
                  }
                })
              }
            }
          } as unknown as ServicesState
        },
        remoteConfig: O.some({
          pn: {
            enabled: isRemoteEnabled,
            notificationServiceId: pnServiceId
          }
        })
      } as GlobalState;

      expect(
        bannerDismiss.isPnActivationReminderBannerRenderableSelector(state)
      ).toBe(result);
    }
  );

  it("should handle an error state for isPnInboxEnabled, treating it as 'true' ", () => {
    // this is to avoid "uncertain" renders
    const state = {
      features: {
        pn: {
          bannerDismiss: {
            ...nonDismissedState
          }
        },
        services: {
          details: {
            preferencesById: {
              [pnServiceId]: pot.noneError({
                id: pnServiceId,
                kind: "generic",
                value: Error("An error")
              })
            }
          }
        } as unknown as ServicesState
      },
      remoteConfig: O.some({
        pn: {
          enabled: true
        }
      })
    } as GlobalState;

    expect(
      bannerDismiss.isPnActivationReminderBannerRenderableSelector(state)
    ).toBe(false);
  });
});
