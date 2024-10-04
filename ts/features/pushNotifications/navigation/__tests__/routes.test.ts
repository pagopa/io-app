import { NOTIFICATIONS_ROUTES } from "../routes";

describe("routes", () => {
  it("should match expected values", () => {
    expect(NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS).toBe(
      "SYSTEM_NOTIFICATION_PERMISSIONS"
    );
  });
});
