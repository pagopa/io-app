import { merge } from "lodash";
import { Action } from "redux";

import { appReducer, createRootReducer } from "..";
import {
  logoutFailure,
  logoutSuccess
} from "../../../features/authentication/common/store/actions";
import { LoginConfigState } from "../../../features/authentication/common/store/reducers/loginConfig";
import { PersistedNotificationsState } from "../../../features/pushNotifications/store/reducers";
import { applicationChangeState } from "../../actions/application";
import { GlobalState } from "../types";

describe("index", () => {
  describe("createRootReducer", () => {
    const notificationsState: PersistedNotificationsState = {
      environment: {
        applicationInitialized: true,
        engagementScreenShownThisSession: true,
        onboardingInstructionsShown: true,
        systemNotificationsEnabled: true,
        pushNotificationPermissionsRequestDuration: 3500
      },
      installation: {
        id: "whateverItIsNotUsed",
        token: "1234567890",
        registeredToken: "1234567890",
        tokenStatus: { status: "sentConfirmed" }
      },
      pendingMessage: {
        foreground: false,
        id: "951753"
      },
      userBehaviour: {
        pushNotificationBannerDismissalCount: 2,
        pushNotificationBannerForceDismissionDate: 1741006934000
      },
      _persist: {
        rehydrated: true,
        version: 1
      }
    };
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    [logoutSuccess(), logoutFailure({ error: Error("") })].forEach(action =>
      it(`should remove 'registeredToken' and set 'tokenStatus' to 'unsent' when receiving an action of type '${action.type}'`, () => {
        const testState = {
          ...initialState,
          notifications: notificationsState
        } as GlobalState;
        const reducer = createRootReducer([]);

        const outputState = reducer(testState, logoutSuccess());

        expect(outputState.notifications).toEqual({
          ...notificationsState,
          installation: {
            ...notificationsState.installation,
            registeredToken: undefined,
            tokenStatus: { status: "unsent" }
          }
        });
      })
    );
    it("should not remove 'registeredToken' and set 'tokenStatus' to 'unsent' when receiving an action that is not 'LOGOUT_SUCCESS' nor 'LOGOUT_FAILURE'", () => {
      const testState = {
        ...initialState,
        notifications: notificationsState
      } as GlobalState;
      const reducer = createRootReducer([]);

      const outputState = reducer(testState, { type: "whatever" } as any);

      expect(outputState.notifications).toEqual(notificationsState);
    });

    /* === === === === === === === === ===
     *  DEVELOPER LOGIN CONFIG
     *  === === === === === === === === === * */
    const loginConfigState: LoginConfigState = {
      oneIdentityLocalFeatureFlag: true,
      oneIdentityEnv: "uat"
    };
    const loginConfigPersist = { version: 0, rehydrated: true };
    const cieLoginPersist = { version: 0, rehydrated: true };

    const buildDeveloperConfigState = () =>
      merge(
        undefined,
        appReducer(undefined, applicationChangeState("active")),
        {
          debug: { isDebugModeEnabled: true, debugData: { key: "value" } },
          features: {
            loginFeatures: {
              cieLogin: {
                useUat: true,
                cieIDSelectedSecurityLevel: "L3",
                _persist: cieLoginPersist
              },
              loginConfig: {
                ...loginConfigState,
                _persist: loginConfigPersist
              }
            }
          }
        } as unknown as GlobalState
      );

    [logoutSuccess(), logoutFailure({ error: Error("") })].forEach(action => {
      it(`should keep 'loginConfig' when receiving an action of type '${action.type}'`, () => {
        const outputState = createRootReducer([])(
          buildDeveloperConfigState(),
          action
        );

        expect(outputState.features.loginFeatures.loginConfig).toEqual({
          ...loginConfigState,
          _persist: loginConfigPersist
        });
      });

      it(`should keep 'cieLogin.useUat' and reset the other session related fields when receiving an action of type '${action.type}'`, () => {
        const outputState = createRootReducer([])(
          buildDeveloperConfigState(),
          action
        );

        expect(outputState.features.loginFeatures.cieLogin.useUat).toBe(true);
        expect(
          outputState.features.loginFeatures.cieLogin.cieIDSelectedSecurityLevel
        ).toBeUndefined();
      });

      it(`should keep 'debug.isDebugModeEnabled' and clear the debug data when receiving an action of type '${action.type}'`, () => {
        const outputState = createRootReducer([])(
          buildDeveloperConfigState(),
          action
        );

        expect(outputState.debug.isDebugModeEnabled).toBe(true);
        expect(outputState.debug.debugData).toEqual({});
      });
    });

    it("should not alter 'loginConfig' when receiving an action that is not 'LOGOUT_SUCCESS' nor 'LOGOUT_FAILURE'", () => {
      const testState = buildDeveloperConfigState();

      const outputState = createRootReducer([])(testState, {
        type: "whatever"
      } as Action);

      expect(outputState.features.loginFeatures.loginConfig).toEqual({
        ...loginConfigState,
        _persist: loginConfigPersist
      });
    });
  });
});
