import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  defaultRequestPayload,
  defaultRequestError,
  successLoadNextPageMessagesPayload,
  successLoadPreviousPageMessagesPayload
} from "../../../../__mocks__/messages";
import {
  loadNextPageMessages,
  loadPreviousPageMessages
} from "../../../actions";
import { reduceLoadPage } from "../loadPage";
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

describe("reduceLoadPage", () => {
  describe(`given a ${getType(loadNextPageMessages.request)} action`, () => {
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
      const action = loadNextPageMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });

      it("should set the target collection to loading", () => {
        const next = reduceLoadPage(initialState, action);
        expect(pot.isLoading(next[stateKey].data)).toBe(true);
      });

      it("should set lastRequest to 'next' on the target collection", () => {
        const next = reduceLoadPage(initialState, action);
        expect(next[stateKey].lastRequest).toBe("next");
      });

      it("should not affect the other collection", () => {
        const next = reduceLoadPage(initialState, action);
        expect(next[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe(`given a ${getType(loadNextPageMessages.success)} action`, () => {
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
      const requestAction = loadNextPageMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });
      const successAction = loadNextPageMessages.success({
        ...successLoadNextPageMessagesPayload,
        filter
      });

      it("should populate the target collection on first load", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
        expect(afterSuccess[stateKey].data).toEqual(
          pot.some({
            page: successLoadNextPageMessagesPayload.messages,
            next: successLoadNextPageMessagesPayload.pagination.next,
            previous: undefined
          })
        );
      });

      it("should append messages on subsequent loads", () => {
        const afterFirst = reduceLoadPage(
          reduceLoadPage(initialState, requestAction),
          successAction
        );
        const afterSecond = reduceLoadPage(
          reduceLoadPage(afterFirst, requestAction),
          successAction
        );
        expect(afterSecond[stateKey].data).toEqual(
          pot.some({
            page: successLoadNextPageMessagesPayload.messages.concat(
              successLoadNextPageMessagesPayload.messages
            ),
            next: successLoadNextPageMessagesPayload.pagination.next,
            previous: undefined
          })
        );
      });

      it("should set lastRequest to undefined", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
        expect(afterSuccess[stateKey].lastRequest).toBeUndefined();
      });

      it("should not update lastUpdateTime", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const beforeTime = afterRequest[stateKey].lastUpdateTime;
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
        expect(afterSuccess[stateKey].lastUpdateTime).toEqual(beforeTime);
      });

      it("should preserve an existing `previous` cursor", () => {
        const withPrevious: AllPaginated = {
          ...initialState,
          [stateKey]: {
            data: pot.some({
              page: [],
              previous: "existing-previous-cursor",
              next: undefined
            }),
            lastRequest: undefined,
            lastUpdateTime: new Date(0)
          }
        };
        const afterSuccess = reduceLoadPage(withPrevious, successAction);
        expect(pot.toUndefined(afterSuccess[stateKey].data)?.previous).toBe(
          "existing-previous-cursor"
        );
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
        expect(afterSuccess[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe(`given a ${getType(loadNextPageMessages.failure)} action`, () => {
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
      const requestAction = loadNextPageMessages.request({
        ...defaultRequestPayload,
        filter,
        fromUserAction: false
      });
      const failureAction = loadNextPageMessages.failure({
        ...defaultRequestError,
        filter
      });

      it("should set the target collection to error", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterFailure = reduceLoadPage(afterRequest, failureAction);
        expect(pot.isError(afterFailure[stateKey].data)).toBe(true);
      });

      it("should store the error reason and a timestamp", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterFailure = reduceLoadPage(afterRequest, failureAction);
        const data = afterFailure[stateKey].data as {
          error: { reason: string; time: Date };
        };
        expect(data.error.reason).toBe(defaultRequestError.error.message);
        expect(data.error.time).toBeInstanceOf(Date);
      });

      it("should use the correct collection's data (not cross-contaminate)", () => {
        // Regression: old loadNextPage failure for archive incorrectly used
        // state.inbox.data instead of state.archive.data
        const withArchiveData: AllPaginated = {
          ...initialState,
          archive: {
            data: pot.some({ page: [], next: "archive-cursor" }),
            lastRequest: "next",
            lastUpdateTime: new Date(0)
          },
          inbox: {
            data: pot.none,
            lastRequest: undefined,
            lastUpdateTime: new Date(0)
          }
        };
        const archiveFailure = loadNextPageMessages.failure({
          ...defaultRequestError,
          filter: { getArchived: true }
        });
        const afterFailure = reduceLoadPage(withArchiveData, archiveFailure);
        // The archive error should wrap archive data (pot.some), not inbox
        // data (pot.none), so its value before the error must be non-none
        expect(pot.isError(afterFailure.archive.data)).toBe(true);
        expect(afterFailure.inbox.data).toEqual(pot.none);
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterFailure = reduceLoadPage(afterRequest, failureAction);
        expect(afterFailure[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

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
        const next = reduceLoadPage(initialState, action);
        expect(pot.isLoading(next[stateKey].data)).toBe(true);
      });

      it("should set lastRequest to 'previous' on the target collection", () => {
        const next = reduceLoadPage(initialState, action);
        expect(next[stateKey].lastRequest).toBe("previous");
      });

      it("should not affect the other collection", () => {
        const next = reduceLoadPage(initialState, action);
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
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
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
        const afterFirst = reduceLoadPage(
          reduceLoadPage(initialState, requestAction),
          successAction
        );
        const afterSecond = reduceLoadPage(
          reduceLoadPage(afterFirst, requestAction),
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
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
        expect(afterSuccess[stateKey].lastRequest).toBeUndefined();
      });

      it("should update lastUpdateTime", () => {
        const before = new Date(0);
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
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
        const afterSuccess = reduceLoadPage(
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
        const afterSuccess = reduceLoadPage(withNext, successAction);
        expect(pot.toUndefined(afterSuccess[stateKey].data)?.next).toBe(
          "existing-next-cursor"
        );
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterSuccess = reduceLoadPage(afterRequest, successAction);
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
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterFailure = reduceLoadPage(afterRequest, failureAction);
        expect(pot.isError(afterFailure[stateKey].data)).toBe(true);
      });

      it("should store the error reason and a timestamp", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterFailure = reduceLoadPage(afterRequest, failureAction);
        const data = afterFailure[stateKey].data as {
          error: { reason: string; time: Date };
        };
        expect(data.error.reason).toBe(defaultRequestError.error.message);
        expect(data.error.time).toBeInstanceOf(Date);
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadPage(initialState, requestAction);
        const afterFailure = reduceLoadPage(afterRequest, failureAction);
        expect(afterFailure[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe("cross-action cursor preservation", () => {
    it("loadNextPageMessages success should not affect the `previous` cursor set by a prior loadPreviousPageMessages success", () => {
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
      const action = loadNextPageMessages.success(
        successLoadNextPageMessagesPayload
      );
      const after = reduceLoadPage(stateWithBothCursors, action);
      expect(pot.toUndefined(after.inbox.data)?.previous).toBe("prev-cursor");
    });

    it("loadPreviousPageMessages success should not affect the `next` cursor set by a prior loadNextPageMessages success", () => {
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
      const after = reduceLoadPage(stateWithBothCursors, action);
      expect(pot.toUndefined(after.inbox.data)?.next).toBe("next-cursor");
    });
  });
});
