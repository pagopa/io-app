import { updateSystemNotificationsEnabled } from "../environment";

describe("updateSystemNotificationsEnabled", () => {
  it("should have 'UPDATE_SYSTEM_NOTIFICATIONS_ENABLED' as type and 'true' payload", () => {
    const action = updateSystemNotificationsEnabled(true);
    expect(action.type).toBe("UPDATE_SYSTEM_NOTIFICATIONS_ENABLED");
    expect(action.payload).toBe(true);
  });
  it("should have 'UPDATE_SYSTEM_NOTIFICATIONS_ENABLED' as type and 'false' payload", () => {
    const action = updateSystemNotificationsEnabled(false);
    expect(action.type).toBe("UPDATE_SYSTEM_NOTIFICATIONS_ENABLED");
    expect(action.payload).toBe(false);
  });
});
