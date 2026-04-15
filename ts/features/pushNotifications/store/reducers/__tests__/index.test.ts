import AsyncStorage from "@react-native-async-storage/async-storage";
import { omit } from "lodash";
import { PersistedState } from "redux-persist";
import {
  NOTIFICATIONS_STORE_VERSION,
  notificationsPersistConfig,
  notificationsReducer,
  persistedNotificationsReducer,
  shouldShowEngagementScreenSelector,
  testable
} from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import * as UTILS from "../../../utils";
import { TokenRegistrationResendDelay } from "../installation";

describe("index", () => {
  describe("Main pushNotifications reducer", () => {
    it("notificationsPersistConfig should match expected values", () => {
      expect(notificationsPersistConfig.key).toBe("notifications");
      expect(notificationsPersistConfig.storage).toBe(AsyncStorage);
      expect(notificationsPersistConfig.version).toBe(
        NOTIFICATIONS_STORE_VERSION
      );
      expect(notificationsPersistConfig.whitelist).toStrictEqual([
        "installation",
        "pendingMessage",
        "userBehaviour"
      ]);
    });
    it("notificationsReducer initial state should match snapshot", () => {
      const state = notificationsReducer(
        undefined,
        applicationChangeState("active")
      );
      const stateWithoutInstallationId = omit(state, "installation.id");
      expect(stateWithoutInstallationId).toMatchSnapshot();
    });
    it("persistedNotificationsReducer initial state should match snapshot", () => {
      const state = persistedNotificationsReducer(
        undefined,
        applicationChangeState("active")
      );
      const stateWithoutInstallationId = omit(state, "installation.id");
      expect(stateWithoutInstallationId).toMatchSnapshot();
    });
  });

  describe("shouldShowEngagementScreenSelector", () => {
    [false, true].forEach(applicationInitialized =>
      [false, true].forEach(onboardingInstructionsShown =>
        [false, true].forEach(systemNotificationsEnabled =>
          [false, true].forEach(userFromSuccessLogin =>
            [10, 900].forEach(pushNotificationPermissionsRequestDuration => {
              const expectedOutput =
                userFromSuccessLogin &&
                !systemNotificationsEnabled &&
                pushNotificationPermissionsRequestDuration < 750 &&
                applicationInitialized &&
                !onboardingInstructionsShown;

              it(`Should output '${expectedOutput}' when 'applicationInitialized' is '${applicationInitialized}' , 'onboardingInstructionsShown' is '${onboardingInstructionsShown}' , 'systemNotificationsEnabled' is '${systemNotificationsEnabled} ' `, () => {
                const state = {
                  features: {
                    loginFeatures: {
                      loginInfo: {
                        userFromSuccessLogin
                      }
                    }
                  },
                  notifications: {
                    environment: {
                      applicationInitialized,
                      onboardingInstructionsShown,
                      systemNotificationsEnabled,
                      pushNotificationPermissionsRequestDuration
                    }
                  }
                } as GlobalState;
                const output = shouldShowEngagementScreenSelector(state);
                expect(output).toBe(expectedOutput);
              });
            })
          )
        )
      )
    );
  });
  describe("NOTIFICATIONS_STORE_VERSION", () => {
    it("should match expected value", () => {
      expect(NOTIFICATIONS_STORE_VERSION).toBe(1);
    });
  });
  describe("migrations", () => {
    const migrations = testable!.migrations;
    it("should apply the first migration", () => {
      const beforeMigrations = {
        installation: {
          id: "whateverItIsNotUsed",
          token: "123984651435461351",
          registeredToken: "123984651435461351"
        },
        pendingMessage: null,
        _persist: {
          version: -1,
          rehydrated: false
        }
      } as PersistedState;

      // Adds userBehaviour
      const afterZero = migrations["0"](beforeMigrations);
      expect(afterZero).toEqual({
        installation: {
          id: "whateverItIsNotUsed",
          token: "123984651435461351",
          registeredToken: "123984651435461351"
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 0,
          pushNotificationBannerForceDismissionDate: undefined
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      });
    });
    it("should apply the second migration with no token", () => {
      const afterZero = {
        installation: {
          id: "whateverItIsNotUsed"
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 2,
          pushNotificationBannerForceDismissionDate: 123
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      } as PersistedState;

      // Adds userBehaviour
      const afterOne = migrations["1"](afterZero);
      expect(afterOne).toEqual({
        installation: {
          id: "whateverItIsNotUsed",
          tokenStatus: { status: "unsent" }
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 2,
          pushNotificationBannerForceDismissionDate: 123
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      });
    });
    it("should apply the second migration with unregistered token", () => {
      const afterZero = {
        installation: {
          id: "whateverItIsNotUsed",
          token: "354684315135131"
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 2,
          pushNotificationBannerForceDismissionDate: 123
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      } as PersistedState;

      // Adds userBehaviour
      const afterOne = migrations["1"](afterZero);
      expect(afterOne).toEqual({
        installation: {
          id: "whateverItIsNotUsed",
          token: "354684315135131",
          tokenStatus: { status: "unsent" }
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 2,
          pushNotificationBannerForceDismissionDate: 123
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      });
    });
    it("should apply the second migration with registered token", () => {
      const afterZero = {
        installation: {
          id: "whateverItIsNotUsed",
          token: "354684315135131",
          registeredToken: "354684315135131"
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 2,
          pushNotificationBannerForceDismissionDate: 123
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      } as PersistedState;
      const registrationTime = TokenRegistrationResendDelay + 1;
      jest
        .spyOn(UTILS, "generateTokenRegistrationTime")
        .mockReturnValue(registrationTime);

      // Adds userBehaviour
      const afterOne = migrations["1"](afterZero);
      expect(afterOne).toEqual({
        installation: {
          id: "whateverItIsNotUsed",
          token: "354684315135131",
          registeredToken: "354684315135131",
          tokenStatus: { status: "sentUnconfirmed", date: 1 }
        },
        pendingMessage: null,
        userBehaviour: {
          pushNotificationBannerDismissalCount: 2,
          pushNotificationBannerForceDismissionDate: 123
        },
        _persist: {
          version: -1,
          rehydrated: false
        }
      });
    });
  });
});
