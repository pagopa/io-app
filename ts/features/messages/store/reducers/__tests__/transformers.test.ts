import { CreatedMessageWithContentAndAttachments } from "../../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { message_1 } from "../../../__mocks__/message";
import { toUIMessageDetails } from "../transformers";

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
