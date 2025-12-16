import {
  resetNotificationBannerDismissState,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
} from "../userBehaviour";

describe("setUserDismissedNotificationsBanner", () => {
  it("Should match expected values", () => {
    const action = setUserDismissedNotificationsBanner();
    expect(action.type).toBe("SET_USER_DISMISSED_NOTIFICATIONS_BANNER");
    expect(action.payload).toBe(undefined);
  });
});
describe("setPushNotificationBannerForceDismissed", () => {
  it("Should match expected values", () => {
    const action = setPushNotificationBannerForceDismissed();
    expect(action.type).toBe("SET_PUSH_NOTIFICATION_BANNER_FORCE_DISMISSED");
    expect(action.payload).toBe(undefined);
  });
});
describe("resetNotificationBannerDismissState", () => {
  it("Should match expected values", () => {
    const action = resetNotificationBannerDismissState();
    expect(action.type).toBe("RESET_NOTIFICATION_BANNER_DISMISS_STATE");
    expect(action.payload).toBe(undefined);
  });
});
