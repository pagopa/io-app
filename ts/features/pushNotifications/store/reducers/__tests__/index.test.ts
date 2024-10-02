import AsyncStorage from "@react-native-async-storage/async-storage";
import { omit } from "lodash";
import {
  NOTIFICATIONS_STORE_VERSION,
  notificationsPersistConfig,
  notificationsReducer,
  persistedNotificationsReducer
} from "..";
import { applicationChangeState } from "../../../../../store/actions/application";

describe("Main pushNotifications reducer", () => {
  it("persistor version should be -1", () => {
    expect(NOTIFICATIONS_STORE_VERSION).toBe(-1);
  });
  it("notificationsPersistConfig should match expected values", () => {
    expect(notificationsPersistConfig.key).toBe("notifications");
    expect(notificationsPersistConfig.storage).toBe(AsyncStorage);
    expect(notificationsPersistConfig.version).toBe(
      NOTIFICATIONS_STORE_VERSION
    );
    expect(notificationsPersistConfig.whitelist).toStrictEqual([
      "installation",
      "pendingMessage"
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
