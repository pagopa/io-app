import { requestAutomaticMessagesRefresh } from "..";
import { MessageListCategory } from "../../../types/messageListCategory";

describe("requestAutomaticMessagesRefresh", () => {
  it("should construct the acton with proper type and payload for 'INBOX' category", () => {
    const category: MessageListCategory = "INBOX";
    const requestAction = requestAutomaticMessagesRefresh(category);
    expect(requestAction.type).toStrictEqual(
      "REQUEST_AUOMATIC_MESSAGE_REFRESH"
    );
    expect(requestAction.payload).toStrictEqual(category);
  });
  it("should construct the acton with proper type and payload for 'ARCHIVE' category", () => {
    const category: MessageListCategory = "ARCHIVE";
    const requestAction = requestAutomaticMessagesRefresh(category);
    expect(requestAction.type).toStrictEqual(
      "REQUEST_AUOMATIC_MESSAGE_REFRESH"
    );
    expect(requestAction.payload).toStrictEqual(category);
  });
});
