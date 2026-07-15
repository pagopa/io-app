import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import {
  defaultRequestError,
  defaultRequestPayload,
  successLoadNextPageMessagesPayload
} from "../../../../__mocks__/messages";
import { loadNextPageMessages } from "../../../actions";
import { reduceLoadNextPage } from "../loadNextPage";
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

describe("reduceLoadNextPage", () => {
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
        const next = reduceLoadNextPage(initialState, action);
        expect(pot.isLoading(next[stateKey].data)).toBe(true);
      });

      it("should set lastRequest to 'next' on the target collection", () => {
        const next = reduceLoadNextPage(initialState, action);
        expect(next[stateKey].lastRequest).toBe("next");
      });

      it("should not affect the other collection", () => {
        const next = reduceLoadNextPage(initialState, action);
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
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const afterSuccess = reduceLoadNextPage(afterRequest, successAction);
        expect(afterSuccess[stateKey].data).toEqual(
          pot.some({
            page: successLoadNextPageMessagesPayload.messages,
            next: successLoadNextPageMessagesPayload.pagination.next,
            previous: undefined
          })
        );
      });

      it("should append messages on subsequent loads", () => {
        const afterFirst = reduceLoadNextPage(
          reduceLoadNextPage(initialState, requestAction),
          successAction
        );
        const afterSecond = reduceLoadNextPage(
          reduceLoadNextPage(afterFirst, requestAction),
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
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const afterSuccess = reduceLoadNextPage(afterRequest, successAction);
        expect(afterSuccess[stateKey].lastRequest).toBeUndefined();
      });

      it("should not update lastUpdateTime", () => {
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const beforeTime = afterRequest[stateKey].lastUpdateTime;
        const afterSuccess = reduceLoadNextPage(afterRequest, successAction);
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
        const afterSuccess = reduceLoadNextPage(withPrevious, successAction);
        expect(pot.toUndefined(afterSuccess[stateKey].data)?.previous).toBe(
          "existing-previous-cursor"
        );
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const afterSuccess = reduceLoadNextPage(afterRequest, successAction);
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
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const afterFailure = reduceLoadNextPage(afterRequest, failureAction);
        expect(pot.isError(afterFailure[stateKey].data)).toBe(true);
      });

      it("should store the error reason and a timestamp", () => {
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const afterFailure = reduceLoadNextPage(afterRequest, failureAction);
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
        const afterFailure = reduceLoadNextPage(
          withArchiveData,
          archiveFailure
        );
        // The archive error should wrap archive data (pot.some), not inbox
        // data (pot.none), so its value before the error must be non-none
        expect(pot.isError(afterFailure.archive.data)).toBe(true);
        expect(afterFailure.inbox.data).toEqual(pot.none);
      });

      it("should not affect the other collection", () => {
        const afterRequest = reduceLoadNextPage(initialState, requestAction);
        const afterFailure = reduceLoadNextPage(afterRequest, failureAction);
        expect(afterFailure[otherKey]).toStrictEqual(initialState[otherKey]);
      });
    });
  });

  describe("cursor preservation", () => {
    it("success should not affect the `previous` cursor set by a prior loadPreviousPageMessages success", () => {
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
      const after = reduceLoadNextPage(stateWithBothCursors, action);
      expect(pot.toUndefined(after.inbox.data)?.previous).toBe("prev-cursor");
    });
  });
});
