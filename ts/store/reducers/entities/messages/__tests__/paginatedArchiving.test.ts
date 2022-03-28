import { pot } from "@pagopa/ts-commons";
import { none } from "fp-ts/lib/Option";
import reducer, { AllPaginated } from "../allPaginated";
import { successReloadMessagesPayload } from "../../../../../__mocks__/messages";
import { upsertMessageStatusAttributes } from "../../../../actions/messages";

describe("reduceUpsertMessageStatusAttributes", () => {
  const defaultState: AllPaginated = {
    inbox: { data: pot.none, lastRequest: none },
    archive: { data: pot.none, lastRequest: none }
  };

  describe("given a pot.none archive", () => {
    const message = successReloadMessagesPayload.messages[0];

    const initialState = {
      ...defaultState,
      inbox: {
        ...defaultState.inbox,
        data: pot.some({
          page: [message],
          previous: message.id,
          next: undefined
        })
      }
    };

    describe("when archiving a message", () => {
      const action = upsertMessageStatusAttributes.request({
        id: message.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      it("then the message should be removed from the inbox", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.page).toEqual([]);
      });
      it("then the inbox cursors should remain unchanged", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.previous).toEqual(
          pot.toUndefined(initialState.inbox.data)?.previous
        );
        expect(pot.toUndefined(finalState.inbox.data)?.next).toEqual(
          pot.toUndefined(initialState.inbox.data)?.next
        );
      });
      it("then the archive should remain pot.none", () => {
        expect(finalState.archive.data).toEqual(pot.none);
      });
    });
  });

  describe("given an empty archive", () => {
    const message = successReloadMessagesPayload.messages[0];

    const initialState = {
      ...defaultState,
      inbox: {
        ...defaultState.inbox,
        data: pot.some({
          page: [message],
          previous: message.id,
          next: undefined
        })
      },
      archive: {
        ...defaultState.archive,
        data: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        })
      }
    };

    describe("when archiving a message", () => {
      const action = upsertMessageStatusAttributes.request({
        id: message.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      it("then the message should be removed from the inbox", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.page).toEqual([]);
      });
      it("then the archive should only contain the message", () => {
        expect(pot.toUndefined(finalState.archive.data)?.page).toEqual([
          message
        ]);
      });
      it("then the previous cursor in the archive should be equal to the message's ID", () => {
        expect(pot.toUndefined(finalState.archive.data)?.previous).toEqual(
          message.id
        );
      });
      it("then the next cursor in the archive should remain undefined", () => {
        expect(pot.toUndefined(finalState.archive.data)?.next).toEqual(
          undefined
        );
      });
    });
  });

  describe("given a partially fetched archive", () => {
    const newerMessage = successReloadMessagesPayload.messages[0];
    const archivedMessage = successReloadMessagesPayload.messages[1];
    const olderMessage = successReloadMessagesPayload.messages[2];
    const initialState = {
      ...defaultState,
      inbox: {
        ...defaultState.inbox,
        data: pot.some({
          page: [newerMessage, olderMessage],
          previous: newerMessage.id,
          next: olderMessage.id
        })
      },
      archive: {
        ...defaultState.archive,
        data: pot.some({
          page: [archivedMessage],
          previous: archivedMessage.id,
          next: archivedMessage.id
        })
      }
    };

    describe("when archiving a message newer than the archived one", () => {
      const action = upsertMessageStatusAttributes.request({
        id: newerMessage.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      it("then the message should be removed from the inbox", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.page).toEqual([
          olderMessage
        ]);
      });
      it("then the archive should contain the message, sorted by ID", () => {
        expect(pot.toUndefined(finalState.archive.data)?.page).toEqual([
          newerMessage,
          archivedMessage
        ]);
      });
      it("then the previous cursor in the archive should be updated", () => {
        expect(pot.toUndefined(finalState.archive.data)?.previous).toEqual(
          newerMessage.id
        );
      });
      it("then the next cursor in the archive should remain unchanged", () => {
        expect(pot.toUndefined(finalState.archive.data)?.next).toEqual(
          pot.toUndefined(initialState.archive.data)?.next
        );
      });
    });

    describe("when archiving a message older than the archived one", () => {
      const action = upsertMessageStatusAttributes.request({
        id: olderMessage.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      it("then the message should be removed from the inbox", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.page).toEqual([
          newerMessage
        ]);
      });
      it("then the archive should remain unchanged", () => {
        expect(finalState.archive.data).toEqual(initialState.archive.data);
      });
    });
  });

  describe("given a fully fetched archive", () => {
    const newerMessage = successReloadMessagesPayload.messages[0];
    const archivedMessage = successReloadMessagesPayload.messages[1];
    const olderMessage = successReloadMessagesPayload.messages[2];
    const initialState = {
      ...defaultState,
      inbox: {
        ...defaultState.inbox,
        data: pot.some({
          page: [newerMessage, olderMessage],
          previous: newerMessage.id,
          next: olderMessage.id
        })
      },
      archive: {
        ...defaultState.archive,
        data: pot.some({
          page: [archivedMessage],
          previous: archivedMessage.id,
          next: undefined
        })
      }
    };

    describe("when archiving a message older than the archived one", () => {
      const action = upsertMessageStatusAttributes.request({
        id: olderMessage.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the message should be removed from the inbox", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.page).toEqual([
          newerMessage
        ]);
      });
      it("then the archive should contain the message, sorted by ID", () => {
        expect(pot.toUndefined(finalState.archive.data)?.page).toEqual([
          archivedMessage,
          olderMessage
        ]);
      });
      it("then the archive cursors should remain unchanged", () => {
        expect(pot.toUndefined(finalState.archive.data)?.previous).toEqual(
          pot.toUndefined(initialState.archive.data)?.previous
        );
        expect(pot.toUndefined(finalState.archive.data)?.next).toEqual(
          pot.toUndefined(initialState.archive.data)?.next
        );
      });
    });

    describe("when archiving a message newer than the archived one", () => {
      const action = upsertMessageStatusAttributes.request({
        id: newerMessage.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the message should be removed from the inbox", () => {
        expect(pot.toUndefined(finalState.inbox.data)?.page).toEqual([
          olderMessage
        ]);
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the archive should contain the message, sorted by ID", () => {
        expect(pot.toUndefined(finalState.archive.data)?.page).toEqual([
          newerMessage,
          archivedMessage
        ]);
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the previous cursor in the archive should be equal to the message's ID", () => {
        expect(pot.toUndefined(finalState.archive.data)?.previous).toEqual(
          newerMessage.id
        );
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the next cursor in the archive should remain undefined", () => {
        expect(pot.toUndefined(finalState.archive.data)?.next).toEqual(
          undefined
        );
      });
    });
  });

  describe("given a partially fetched archive with multiple messages", () => {
    const newestMessage = successReloadMessagesPayload.messages[0];
    const message = successReloadMessagesPayload.messages[1];
    const oldestMessage = successReloadMessagesPayload.messages[2];
    const initialState = {
      ...defaultState,
      inbox: {
        ...defaultState.inbox,
        data: pot.some({
          page: [message],
          previous: message.id,
          next: undefined
        })
      },
      archive: {
        ...defaultState.archive,
        data: pot.some({
          page: [newestMessage, oldestMessage],
          previous: newestMessage.id,
          next: oldestMessage.id
        })
      }
    };

    describe("when archiving a message", () => {
      const action = upsertMessageStatusAttributes.request({
        id: message.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      it("then the archive should contain the message, sorted by ID", () => {
        expect(pot.toUndefined(finalState.archive.data)?.page).toEqual([
          newestMessage,
          message,
          oldestMessage
        ]);
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the cursors in the archive should remain unchanged", () => {
        expect(pot.toUndefined(finalState.archive.data)?.previous).toEqual(
          pot.toUndefined(initialState.archive.data)?.previous
        );
        expect(pot.toUndefined(finalState.archive.data)?.next).toEqual(
          pot.toUndefined(initialState.archive.data)?.next
        );
      });
    });
  });

  describe("given a fully fetched archive with multiple messages", () => {
    const newestMessage = successReloadMessagesPayload.messages[0];
    const message = successReloadMessagesPayload.messages[1];
    const oldestMessage = successReloadMessagesPayload.messages[2];
    const initialState = {
      ...defaultState,
      inbox: {
        ...defaultState.inbox,
        data: pot.some({
          page: [message],
          previous: message.id,
          next: undefined
        })
      },
      archive: {
        ...defaultState.archive,
        data: pot.some({
          page: [newestMessage, oldestMessage],
          previous: newestMessage.id,
          next: undefined
        })
      }
    };

    describe("when archiving a message", () => {
      const action = upsertMessageStatusAttributes.request({
        id: message.id,
        update: { tag: "archiving", isArchived: true }
      });

      const finalState = reducer(initialState, action);

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("then the cursors in the archive should remain unchanged", () => {
        expect(pot.toUndefined(finalState.archive.data)?.previous).toEqual(
          pot.toUndefined(initialState.archive.data)?.previous
        );
        expect(pot.toUndefined(finalState.archive.data)?.next).toEqual(
          pot.toUndefined(initialState.archive.data)?.next
        );
      });
    });
  });
});
