import { CreatedMessageWithContentAndAttachments } from "../../../../../../definitions/communications/CreatedMessageWithContentAndAttachments";
import { ThirdPartyAttachment } from "../../../../../../definitions/communications/ThirdPartyAttachment";
import { message_1 } from "../../../__mocks__/message";

import { attachmentDisplayName, toUIMessageDetails } from "../transformers";

const inputWithoutDueDate: CreatedMessageWithContentAndAttachments = {
  ...message_1,
  content: {
    ...message_1.content,
    due_date: undefined
  }
};

describe("`toUIMessageDetails` function", () => {
  describe("when `content.due_date` is undefined", () => {
    test("should transform it to undefined", () => {
      expect(toUIMessageDetails(inputWithoutDueDate).dueDate).not.toBeDefined();
    });
  });
});

describe("attachmentDisplayName", () => {
  it("should properly convert name giving a display name source", () => {
    const thirdPartyAttachment = {
      id: "1",
      name: "The name"
    } as ThirdPartyAttachment;
    const displayName = attachmentDisplayName(thirdPartyAttachment);
    expect(displayName).toBe(thirdPartyAttachment.name);
  });
  it("should properly convert name giving an unavailable name source", () => {
    const thirdPartyAttachment = {
      id: "1"
    } as ThirdPartyAttachment;
    const displayName = attachmentDisplayName(thirdPartyAttachment);
    expect(displayName).toBe(thirdPartyAttachment.id);
  });
});
