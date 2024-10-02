import { notificationsInfoScreenConsent } from "../profileNotificationPermissions";

describe("notificationsInfoScreenConsent", () => {
  it("should have 'NOTIFICATIONS_INFO_SCREEN_CONSENT' as type and no payload", () => {
    const action = notificationsInfoScreenConsent();
    expect(action.type).toBe("NOTIFICATIONS_INFO_SCREEN_CONSENT");
    expect(action.payload).toBeUndefined();
  });
});
