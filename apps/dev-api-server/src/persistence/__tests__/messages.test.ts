import { CreatedMessageWithContentAndEnrichedData } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndEnrichedData";

import MessagesDB from "../../features/messages/persistence/messagesDatabase";

const buildMessage = (id: string) =>
  ({ id }) as unknown as CreatedMessageWithContentAndEnrichedData;

describe("the Message persistence", () => {
  beforeEach(() => {
    MessagesDB.dropAll();
  });

  afterAll(() => {
    MessagesDB.dropAll();
  });

  describe("when a list of messages is persisted", () => {
    it("they should be stored inversely sorted by ID", () => {
      const unsortedMessages = ["A1", "C0", "A3"].map(buildMessage);
      MessagesDB.persist(unsortedMessages);
      expect(MessagesDB.findAllInbox().map(m => m.id)).toEqual([
        "C0",
        "A3",
        "A1"
      ]);
    });
  });

  describe("when a message is archived", () => {
    it("should be moved from Inbox to Archived collection, sorted", () => {
      MessagesDB.persist(["C", "B", "A"].map(buildMessage));
      expect(MessagesDB.findAllArchived()).toEqual([]);
      MessagesDB.archive("B");
      expect(MessagesDB.findAllInbox().map(m => m.id)).toEqual(["C", "A"]);
      expect(MessagesDB.findAllArchived().map(m => m.id)).toEqual(["B"]);
      MessagesDB.archive("C");
      expect(MessagesDB.findAllInbox().map(m => m.id)).toEqual(["A"]);
      expect(MessagesDB.findAllArchived().map(m => m.id)).toEqual(["C", "B"]);
    });
  });

  describe("when a message is unarchived", () => {
    it("should be moved from Archived to Inbox collection, sorted", () => {
      MessagesDB.persist(["C", "B", "A"].map(buildMessage));
      MessagesDB.archive("B");
      MessagesDB.unarchive("B");
      expect(MessagesDB.findAllArchived().map(m => m.id)).toEqual([]);
      expect(MessagesDB.findAllInbox().map(m => m.id)).toEqual(["C", "B", "A"]);
    });
  });
});
