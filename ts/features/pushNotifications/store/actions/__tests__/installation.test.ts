import {
  newPushNotificationsToken,
  pushNotificationsTokenUploaded
} from "../installation";

describe("newPushNotificationsToken", () => {
  it("should have 'NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE' as type and the specified payload", () => {
    const payload = "The Payload";
    const action = newPushNotificationsToken(payload);
    expect(action.type).toBe("NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE");
    expect(action.payload).toBe(payload);
  });
});

describe("pushNotificationsTokenUploaded", () => {
  it("should have 'NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED' as type and the specified payload", () => {
    const payload = "The Payload";
    const action = pushNotificationsTokenUploaded(payload);
    expect(action.type).toBe("NOTIFICATIONS_INSTALLATION_TOKEN_REGISTERED");
    expect(action.payload).toBe(payload);
  });
});
