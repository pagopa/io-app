import {
  applicationChangeState,
  applicationInitialized
} from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  setEngagementScreenShown,
  setPushPermissionsRequestDuration,
  updateSystemNotificationsEnabled
} from "../../actions/environment";
import { notificationsInfoScreenConsent } from "../../actions/profileNotificationPermissions";
import {
  areNotificationPermissionsEnabledSelector,
  environmentReducer,
  INITIAL_STATE
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
        systemNotificationsEnabled: true,
        engagementScreenShownThisSession: false
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
        systemNotificationsEnabled: false,
        engagementScreenShownThisSession: false
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
        systemNotificationsEnabled: false,
        engagementScreenShownThisSession: false
      },
      applicationInitialized({ actionsToWaitFor: [] })
    );
    expect(state.applicationInitialized).toBe(true);
    expect(state.onboardingInstructionsShown).toBe(false);
    expect(state.systemNotificationsEnabled).toBe(false);
  });
  it("'pushNotificationPermissionsRequestDuration' should be '100' after receiving 'setPushPermissionsRequestDuration(100)'", () => {
    const userBehaviourState = environmentReducer(
      {
        applicationInitialized: true,
        onboardingInstructionsShown: false,
        systemNotificationsEnabled: false,
        engagementScreenShownThisSession: false
      },
      setPushPermissionsRequestDuration(100)
    );
    expect(userBehaviourState.pushNotificationPermissionsRequestDuration).toBe(
      100
    );
  });
  it("'engagementScreenShownThisSession' should be 'true' after receiving 'setEngagementScreenShown'", () => {
    const userBehaviourState = environmentReducer(
      {
        applicationInitialized: true,
        onboardingInstructionsShown: false,
        systemNotificationsEnabled: false,
        engagementScreenShownThisSession: false
      },
      setEngagementScreenShown()
    );
    expect(userBehaviourState.engagementScreenShownThisSession).toBe(true);
  });
});

describe("areNotificationPermissionsEnabledSelector", () => {
  it("should output 'true' when 'systemNotificationsEnabled' is 'true'", () => {
    const state = {
      notifications: {
        environment: {
          systemNotificationsEnabled: true
        }
      }
    } as GlobalState;
    const notificationPermissionsEnabled =
      areNotificationPermissionsEnabledSelector(state);
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
      areNotificationPermissionsEnabledSelector(state);
    expect(notificationPermissionsEnabled).toBe(false);
  });
});
