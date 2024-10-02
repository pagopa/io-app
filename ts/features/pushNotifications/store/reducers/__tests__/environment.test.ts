import {
  applicationChangeState,
  applicationInitialized
} from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { updateSystemNotificationsEnabled } from "../../actions/environment";
import { notificationsInfoScreenConsent } from "../../actions/profileNotificationPermissions";
import {
  areNotificationPermissionsEnabled,
  INITIAL_STATE,
  environmentReducer
} from "../environment";

describe("environment reducer initial state", () => {
  it("should match expected values", () => {
    expect(INITIAL_STATE).toMatchSnapshot();
  });
});

describe("environmentReducer", () => {
  it("output state should match INITIAL_STATE for an unrelated action", () => {
    const state = environmentReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(state).toStrictEqual(INITIAL_STATE);
  });
  it("'systemNotificationsEnabled' in output state should be 'true' after receiving 'updateSystemNotificationsEnabled(true)'", () => {
    const state = environmentReducer(
      undefined,
      updateSystemNotificationsEnabled(true)
    );
    expect(state.applicationInitialized).toBe(false);
    expect(state.onboardingInstructionsShown).toBe(false);
    expect(state.systemNotificationsEnabled).toBe(true);
  });
  it("'systemNotificationsEnabled' in output state should be 'false' after receiving 'updateSystemNotificationsEnabled(false)'", () => {
    const state = environmentReducer(
      {
        applicationInitialized: false,
        onboardingInstructionsShown: false,
        systemNotificationsEnabled: true
      },
      updateSystemNotificationsEnabled(false)
    );
    expect(state.applicationInitialized).toBe(false);
    expect(state.onboardingInstructionsShown).toBe(false);
    expect(state.systemNotificationsEnabled).toBe(false);
  });
  it("'onboardingInstructionsShown' in output state should be 'true' after receiving 'notificationsInfoScreenConsent'", () => {
    const state = environmentReducer(
      {
        applicationInitialized: false,
        onboardingInstructionsShown: false,
        systemNotificationsEnabled: false
      },
      notificationsInfoScreenConsent()
    );
    expect(state.applicationInitialized).toBe(false);
    expect(state.onboardingInstructionsShown).toBe(true);
    expect(state.systemNotificationsEnabled).toBe(false);
  });
  it("'applicationInitialized' in output state should be 'true' after receiving 'applicationInitialized'", () => {
    const state = environmentReducer(
      {
        applicationInitialized: false,
        onboardingInstructionsShown: false,
        systemNotificationsEnabled: false
      },
      applicationInitialized({ actionsToWaitFor: [] })
    );
    expect(state.applicationInitialized).toBe(true);
    expect(state.onboardingInstructionsShown).toBe(false);
    expect(state.systemNotificationsEnabled).toBe(false);
  });
});

describe("areNotificationPermissionsEnabled selector", () => {
  it("should output 'true' when 'systemNotificationsEnabled' is 'true'", () => {
    const state = {
      notifications: {
        environment: {
          systemNotificationsEnabled: true
        }
      }
    } as GlobalState;
    const notificationPermissionsEnabled =
      areNotificationPermissionsEnabled(state);
    expect(notificationPermissionsEnabled).toBe(true);
  });
  it("should output 'false' when 'systemNotificationsEnabled' is 'false'", () => {
    const state = {
      notifications: {
        environment: {
          systemNotificationsEnabled: false
        }
      }
    } as GlobalState;
    const notificationPermissionsEnabled =
      areNotificationPermissionsEnabled(state);
    expect(notificationPermissionsEnabled).toBe(false);
  });
});
