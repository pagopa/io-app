import * as pot from "@pagopa/ts-commons/lib/pot";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { successReloadMessagesPayload } from "../../../__mocks__/messages";
import { UIMessage } from "../../../types";
import {
  loadMessageById,
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes
} from "../../actions";
import reducer, { getPaginatedMessageErrorKindById } from "../paginatedById";

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

    describe("when loadMessageById fails", () => {
      const message = successReloadMessagesPayload.messages[0];
      const error = new Error("An error occurred");

      (["generic", "messageNotFound"] as const).forEach(kind => {
        it(`with kind '${kind}', the pot becomes an error pot with { error, kind: '${kind}' }`, () => {
          const action = loadMessageById.failure({
            id: message.id,
            error,
            kind
          });
          const state = reducer(initialState, action);
          const messagePot = state[message.id];
          expect(pot.isError(messagePot)).toBeTruthy();
          const messageError = pot.isError(messagePot) && messagePot.error;
          expect(messageError).toEqual({
            error,
            kind
          });
        });
      });
    });
  });

  describe("getPaginatedMessageErrorKindById", () => {
    const message = successReloadMessagesPayload.messages[0];
    const baseState = appReducer(undefined, applicationChangeState("active"));

    it.each([
      { name: "message not in state (pot.none)", state: baseState },
      {
        name: "message loaded successfully (pot.some)",
        state: appReducer(baseState, loadMessageById.success(message))
      },
      {
        name: "message loading successfully (pot.noneLoading)",
        state: appReducer(
          baseState,
          loadMessageById.request({ id: message.id })
        )
      }
    ])("returns undefined when $name", ({ state }) => {
      const result = getPaginatedMessageErrorKindById(state, message.id);
      expect(result).toBeUndefined();
    });

    it.each(["generic", "messageNotFound"] as const)(
      "returns %s when failure dispatched with kind %s",
      kind => {
        const state = appReducer(
          baseState,
          loadMessageById.failure({
            id: message.id,
            error: new Error("An error occurred"),
            kind
          })
        );
        const result = getPaginatedMessageErrorKindById(state, message.id);
        expect(result).toBe(kind);
      }
    );
  });
});
