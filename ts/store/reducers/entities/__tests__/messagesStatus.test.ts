import { createStandardAction } from "typesafe-actions";
import { CreatedMessageWithContent } from "../../../../../definitions/backend/CreatedMessageWithContent";
import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { MessageContent } from "../../../../../definitions/backend/MessageContent";
import { DEPRECATED_loadMessage } from "../../../actions/messages";
import { Action } from "../../../actions/types";
import reducer, {
  EMPTY_MESSAGE_STATUS,
  MessagesStatus
} from "../messages/messagesStatus";
import { differentProfileLoggedIn } from "../../../actions/crossSessions";

export const dymmyAction = createStandardAction("DUMMY")();

const messageWithContent = {
  created_at: new Date(),
  fiscal_code: "RSSMRA83A12H501D" as FiscalCode,
  id: "93726BD8-D29C-48F2-AE6D-2F",
  sender_service_id: "dev-service_0",
  time_to_live: 3600,
  content: {
    subject: "Subject - test 1",
    markdown: "markdown",
    due_date: new Date(),
    payment_data: {
      notice_number: "012345678912345678",
      amount: 406,
      invalid_after_due_date: false
    }
  } as MessageContent
} as CreatedMessageWithContent;

describe("messagesStatus reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, dymmyAction as unknown as Action)).toEqual({});
  });

  it("should return the loaded message with default value", () => {
    [1, 2, 3].forEach(_ => {
      // should return always the same state (cause the id is the same)
      const state = reducer(
        undefined,
        DEPRECATED_loadMessage.success(messageWithContent)
      );
      expect(state).toEqual({ [messageWithContent.id]: EMPTY_MESSAGE_STATUS });
      testLength(state, 1);
    });
  });

  it("should return the loaded message with default value", () => {
    const state = reducer(
      { [messageWithContent.id]: EMPTY_MESSAGE_STATUS },
      DEPRECATED_loadMessage.success({ ...messageWithContent, id: "NEW_ID" })
    );
    expect(state.NEW_ID).toEqual(EMPTY_MESSAGE_STATUS);
    testLength(state, 2);
  });

  describe("when `differentProfileLoggedIn` is passed and a message is already persisted", () => {
    it("should return the initial state", () => {
      const notEmptyState = reducer(
        undefined,
        DEPRECATED_loadMessage.success(messageWithContent)
      );
      expect(reducer(notEmptyState, differentProfileLoggedIn())).toEqual({});
    });
  });
});

const testLength = (state: MessagesStatus, expectedLength: number) => {
  expect(Object.keys(state).length).toEqual(expectedLength);
};
