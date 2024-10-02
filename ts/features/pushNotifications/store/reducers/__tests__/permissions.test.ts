import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { updateSystemNotificationsEnabled } from "../../actions/permissions";
import {
  areNotificationPermissionsEnabled,
  INITIAL_STATE,
  permissionsReducer
} from "../permissions";

describe("permissions reducer initial state", () => {
  it("should match expected values", () => {
    expect(INITIAL_STATE).toMatchSnapshot();
  });
});

describe("permissionsReducer", () => {
  it("output state should match INITIAL_STATE for an unrelated action", () => {
    const state = permissionsReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(state).toStrictEqual(INITIAL_STATE);
  });
  it("'systemNotificationsEnabled' in output state should be 'true' after receiving 'updateSystemNotificationsEnabled(true)'", () => {
    const state = permissionsReducer(
      undefined,
      updateSystemNotificationsEnabled(true)
    );
    expect(state.systemNotificationsEnabled).toBe(true);
  });
  it("'systemNotificationsEnabled' in output state should be 'false' after receiving 'updateSystemNotificationsEnabled(false)'", () => {
    const state = permissionsReducer(
      { systemNotificationsEnabled: true },
      updateSystemNotificationsEnabled(false)
    );
    expect(state.systemNotificationsEnabled).toBe(false);
  });
});

describe("areNotificationPermissionsEnabled selector", () => {
  it("should output 'true' when 'systemNotificationsEnabled' is 'true'", () => {
    const state = {
      notifications: {
        permissions: {
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
        permissions: {
          systemNotificationsEnabled: false
        }
      }
    } as GlobalState;
    const notificationPermissionsEnabled =
      areNotificationPermissionsEnabled(state);
    expect(notificationPermissionsEnabled).toBe(false);
  });
});
