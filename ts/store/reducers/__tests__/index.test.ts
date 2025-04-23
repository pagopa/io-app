import { appReducer, createRootReducer } from "..";
import { PersistedNotificationsState } from "../../../features/pushNotifications/store/reducers";
import { applicationChangeState } from "../../actions/application";
import {
  logoutFailure,
  logoutSuccess
} from "../../../features/authentication/common/store/actions";
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
  });
});
