import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  defaultRequestError,
  defaultRequestPayload,
  successReloadMessagesPayload
} from "../../../../__mocks__/messages";
import { reloadAllMessages } from "../../../actions";
import { reduceReloadAll } from "../reloadAll";
import { AllPaginated } from "../types";

const emptyCollection = {
  data: pot.none,
  lastRequest: undefined,
  lastUpdateTime: new Date(0)
} as const;

const initialState: AllPaginated = {
  archive: { ...emptyCollection },
  inbox: { ...emptyCollection },
  shownCategory: "INBOX"
};

describe("reduceReloadAll", () => {
  describe.each([
    {
      label: "Archive",
      filter: { getArchived: true },
      stateKey: "archive" as const
    },
    {
      label: "Inbox",
      filter: { getArchived: false },
      stateKey: "inbox" as const
    }
  ])("for $label ($stateKey)", ({ filter, stateKey }) => {
    const otherKey = stateKey === "archive" ? "inbox" : "archive";

    describe(`given a ${getType(reloadAllMessages.request)} action`, () => {
      const action = reloadAllMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });

      it("should set the target collection to loading", () => {
        const next = reduceReloadAll(initialState, action);
        expect(pot.isLoading(next[stateKey].data)).toBe(true);
      });

      it("should set lastRequest to 'all'", () => {
        const next = reduceReloadAll(initialState, action);
        expect(next[stateKey].lastRequest).toBe("all");
      });

      it("should not affect the other collection", () => {
        const next = reduceReloadAll(initialState, action);
        expect(next[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });

    describe(`given a ${getType(reloadAllMessages.success)} action`, () => {
      const requestAction = reloadAllMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });
      const successAction = reloadAllMessages.success({
        ...successReloadMessagesPayload,
        filter
      });

      it("should replace the target collection with the payload", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterSuccess = reduceReloadAll(afterRequest, successAction);
        expect(afterSuccess[stateKey].data).toEqual(
          pot.some({
            page: successReloadMessagesPayload.messages,
            previous: successReloadMessagesPayload.pagination.previous,
            next: successReloadMessagesPayload.pagination.next
          })
        );
      });

      it("should set lastRequest to undefined", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterSuccess = reduceReloadAll(afterRequest, successAction);
        expect(afterSuccess[stateKey].lastRequest).toBeUndefined();
      });

      it("should update lastUpdateTime", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterSuccess = reduceReloadAll(afterRequest, successAction);
        expect(afterSuccess[stateKey].lastUpdateTime.getTime()).toBeGreaterThan(
          new Date(0).getTime()
        );
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterSuccess = reduceReloadAll(afterRequest, successAction);
        expect(afterSuccess[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });

    describe(`given a ${getType(reloadAllMessages.failure)} action`, () => {
      const requestAction = reloadAllMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });
      const failureAction = reloadAllMessages.failure({
        ...defaultRequestError,
        filter
      });

      it("should set the target collection to error", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterFailure = reduceReloadAll(afterRequest, failureAction);
        expect(pot.isError(afterFailure[stateKey].data)).toBe(true);
      });

      it("should store the error reason and a timestamp", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterFailure = reduceReloadAll(afterRequest, failureAction);
        const data = afterFailure[stateKey].data as {
          error: { reason: string; time: Date };
        };
        expect(data.error.reason).toBe(defaultRequestError.error.message);
        expect(data.error.time).toBeInstanceOf(Date);
      });

      it("should preserve the lastRequest", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterFailure = reduceReloadAll(afterRequest, failureAction);
        expect(afterFailure[stateKey].lastRequest).toBe(
          afterRequest[stateKey].lastRequest
        );
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceReloadAll(initialState, requestAction);
        const afterFailure = reduceReloadAll(afterRequest, failureAction);
        expect(afterFailure[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });
});
