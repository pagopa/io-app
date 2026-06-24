import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  defaultRequestPayload,
  defaultRequestError,
  successLoadPreviousPageMessagesPayload
} from "../../../../__mocks__/messages";
import { loadPreviousPageMessages } from "../../../actions";
import { reduceLoadPreviousPage } from "../loadPreviousPage";
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

describe("reduceLoadPreviousPage", () => {
  describe(`given a ${getType(loadPreviousPageMessages.request)} action`, () => {
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
      const action = loadPreviousPageMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });

      it("should set the target collection to loading", () => {
        const next = reduceLoadPreviousPage(initialState, action);
        expect(pot.isLoading(next[stateKey].data)).toBe(true);
      });

      it("should set lastRequest to 'previous' on the target collection", () => {
        const next = reduceLoadPreviousPage(initialState, action);
        expect(next[stateKey].lastRequest).toBe("previous");
      });

      it("should not affect the other collection", () => {
        const next = reduceLoadPreviousPage(initialState, action);
        expect(next[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe(`given a ${getType(loadPreviousPageMessages.success)} action`, () => {
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
      const requestAction = loadPreviousPageMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });
      const successAction = loadPreviousPageMessages.success({
        ...successLoadPreviousPageMessagesPayload,
        filter
      });

      it("should populate the target collection on first load", () => {
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterSuccess = reduceLoadPreviousPage(
          afterRequest,
          successAction
        );
        expect(afterSuccess[stateKey].data).toEqual(
          pot.some({
            page: successLoadPreviousPageMessagesPayload.messages,
            previous:
              successLoadPreviousPageMessagesPayload.pagination.previous,
            next: undefined
          })
        );
      });

      it("should prepend messages on subsequent loads", () => {
        const afterFirst = reduceLoadPreviousPage(
          reduceLoadPreviousPage(initialState, requestAction),
          successAction
        );
        const afterSecond = reduceLoadPreviousPage(
          reduceLoadPreviousPage(afterFirst, requestAction),
          successAction
        );
        expect(afterSecond[stateKey].data).toEqual(
          pot.some({
            page: successLoadPreviousPageMessagesPayload.messages.concat(
              successLoadPreviousPageMessagesPayload.messages
            ),
            previous:
              successLoadPreviousPageMessagesPayload.pagination.previous,
            next: undefined
          })
        );
      });

      it("should set lastRequest to undefined", () => {
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterSuccess = reduceLoadPreviousPage(
          afterRequest,
          successAction
        );
        expect(afterSuccess[stateKey].lastRequest).toBeUndefined();
      });

      it("should update lastUpdateTime", () => {
        const before = new Date(0);
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterSuccess = reduceLoadPreviousPage(
          afterRequest,
          successAction
        );
        expect(afterSuccess[stateKey].lastUpdateTime.getTime()).toBeGreaterThan(
          before.getTime()
        );
      });

      it("should preserve an existing `previous` cursor when response has none", () => {
        const withPrevious: AllPaginated = {
          ...initialState,
          [stateKey]: {
            data: pot.some({
              page: successLoadPreviousPageMessagesPayload.messages,
              previous: "preserved-cursor",
              next: undefined
            }),
            lastRequest: "previous",
            lastUpdateTime: new Date(0)
          }
        };
        const emptyPaginationAction = loadPreviousPageMessages.success({
          messages: [],
          pagination: { previous: undefined },
          filter,
          fromUserAction: false
        });
        const afterSuccess = reduceLoadPreviousPage(
          withPrevious,
          emptyPaginationAction
        );
        expect(pot.toUndefined(afterSuccess[stateKey].data)?.previous).toBe(
          "preserved-cursor"
        );
      });

      it("should preserve an existing `next` cursor", () => {
        const withNext: AllPaginated = {
          ...initialState,
          [stateKey]: {
            data: pot.some({
              page: [],
              previous: undefined,
              next: "existing-next-cursor"
            }),
            lastRequest: undefined,
            lastUpdateTime: new Date(0)
          }
        };
        const afterSuccess = reduceLoadPreviousPage(withNext, successAction);
        expect(pot.toUndefined(afterSuccess[stateKey].data)?.next).toBe(
          "existing-next-cursor"
        );
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterSuccess = reduceLoadPreviousPage(
          afterRequest,
          successAction
        );
        expect(afterSuccess[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe(`given a ${getType(loadPreviousPageMessages.failure)} action`, () => {
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
      const requestAction = loadPreviousPageMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });
      const failureAction = loadPreviousPageMessages.failure({
        ...defaultRequestError,
        filter
      });

      it("should set the target collection to error", () => {
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterFailure = reduceLoadPreviousPage(
          afterRequest,
          failureAction
        );
        expect(pot.isError(afterFailure[stateKey].data)).toBe(true);
      });

      it("should store the error reason and a timestamp", () => {
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterFailure = reduceLoadPreviousPage(
          afterRequest,
          failureAction
        );
        const data = afterFailure[stateKey].data as {
          error: { reason: string; time: Date };
        };
        expect(data.error.reason).toBe(defaultRequestError.error.message);
        expect(data.error.time).toBeInstanceOf(Date);
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadPreviousPage(
          initialState,
          requestAction
        );
        const afterFailure = reduceLoadPreviousPage(
          afterRequest,
          failureAction
        );
        expect(afterFailure[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe("cursor preservation", () => {
    it("success should not affect the `next` cursor set by a prior loadNextPageMessages success", () => {
      const stateWithBothCursors: AllPaginated = {
        ...initialState,
        inbox: {
          data: pot.some({
            page: [],
            previous: "prev-cursor",
            next: "next-cursor"
          }),
          lastRequest: undefined,
          lastUpdateTime: new Date(0)
        }
      };
      const action = loadPreviousPageMessages.success(
        successLoadPreviousPageMessagesPayload
      );
      const after = reduceLoadPreviousPage(stateWithBothCursors, action);
      expect(pot.toUndefined(after.inbox.data)?.next).toBe("next-cursor");
    });
  });
});
