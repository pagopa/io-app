import * as pot from "@pagopa/ts-commons/lib/pot";
import reducer from "../paginatedById";
import {
  loadMessageById,
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes
} from "../../actions";
import { successReloadMessagesPayload } from "../../../__mocks__/messages";
import { UIMessage } from "../../../types";

describe("paginatedById reducer", () => {
  describe("given an empty initial state", () => {
    const initialState = {};

    describe("when reloadAllMessages succeeds", () => {
      const allMessagesPayload = successReloadMessagesPayload;
      const action = reloadAllMessages.success(allMessagesPayload);
      it("then messages are stored by their ID", () => {
        const state = reducer(initialState, action);
        expect(Object.keys(state)).toEqual(
          allMessagesPayload.messages.map(_ => _.id)
        );
      });
    });

    describe("when loadNextPageMessages succeeds", () => {
      const nextMessagesPayload = successReloadMessagesPayload;
      const action = loadNextPageMessages.success(nextMessagesPayload);
      it("then messages are stored by their ID", () => {
        const state = reducer(initialState, action);
        expect(Object.keys(state)).toEqual(
          nextMessagesPayload.messages.map(_ => _.id)
        );
      });
    });

    describe("when loadPreviousPageMessages succeeds", () => {
      const previousMessagesPayload = successReloadMessagesPayload;
      const action = loadPreviousPageMessages.success(previousMessagesPayload);
      it("then messages are stored by their ID", () => {
        const state = reducer(initialState, action);
        expect(Object.keys(state)).toEqual(
          previousMessagesPayload.messages.map(_ => _.id)
        );
      });
    });

    describe("when loadMessageById succeeds", () => {
      const message = successReloadMessagesPayload.messages[0];
      const action = loadMessageById.success(message);
      it("then message is stored by its ID", () => {
        const state = reducer(initialState, action);
        expect(Object.keys(state)).toEqual([message.id]);
      });
    });

    describe("when upsertMessageStatusAttributes succeeds", () => {
      const message: UIMessage = {
        ...successReloadMessagesPayload.messages[0],
        isRead: false,
        isArchived: false
      };
      const nonEmptyInitialState = { [message.id]: pot.some(message) };
      const action = upsertMessageStatusAttributes.success({
        message,
        update: { tag: "bulk", isArchived: true }
      });
      it("then message state is updated", () => {
        const state = reducer(nonEmptyInitialState, action);
        expect(pot.toUndefined(state[message.id])?.isArchived).toBeTruthy();
        expect(pot.toUndefined(state[message.id])?.isRead).toBeTruthy();
      });
    });
  });
});
