import { PendingMessageState } from "../../reducers/pendingMessage";
import {
  clearNotificationPendingMessage,
  updateNotificationsPendingMessage
} from "../pendingMessage";

describe("updateNotificationsPendingMessage", () => {
  it("should have 'NOTIFICATIONS_PENDING_MESSAGE_UPDATE' as type and given payload", () => {
    const pendingMessageState: PendingMessageState = {
      foreground: true,
      id: "01J8R2C1Q3ZXE5BX7XHSTTN493"
    };
    const action = updateNotificationsPendingMessage(pendingMessageState);
    expect(action.type).toBe("NOTIFICATIONS_PENDING_MESSAGE_UPDATE");
    expect(action.payload).toBe(pendingMessageState);
  });
});

describe("clearNotificationPendingMessage", () => {
  it("should have 'NOTIFICATIONS_PENDING_MESSAGE_CLEAR' as type and no payload", () => {
    const action = clearNotificationPendingMessage();
    expect(action.type).toBe("NOTIFICATIONS_PENDING_MESSAGE_CLEAR");
    expect(action.payload).toBeUndefined();
  });
});
