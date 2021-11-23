import { getType } from "typesafe-actions";
import { none, some } from "fp-ts/lib/Option";
import { pot } from "@pagopa/ts-commons";

import {
  successLoadNextPageMessagesPayload,
  successLoadPreviousPageMessagesPayload,
  successReloadMessagesPayload
} from "../../../../../__mocks__/messages";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../../actions/messages";
import { GlobalState } from "../../../types";
import reducer, {
  isLoadingPreviousPage,
  isLoadingNextPage,
  AllPaginated
} from "../allPaginated";

describe("allPaginated reducer", () => {
  describe("when a `reloadAllMessages` action is sent", () => {
    const actionRequest = reloadAllMessages.request({ pageSize: 8 });
    describe(`when a ${getType(reloadAllMessages.request)} is sent`, () => {
      it("should reset the state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).data)).toBe(
          true
        );
      });
      it("should set the lastRequest to 'all'", () => {
        expect(reducer(undefined, actionRequest).lastRequest).toEqual(
          some("all")
        );
      });

      describe(`and then a ${getType(
        reloadAllMessages.success
      )} is sent`, () => {
        const initialState = reducer(undefined, actionRequest);
        const action = reloadAllMessages.success(successReloadMessagesPayload);

        it("should reset the state to the payload's content", () => {
          expect(reducer(initialState, action).data).toEqual(
            pot.some({
              page: successReloadMessagesPayload.messages,
              next: successReloadMessagesPayload.pagination.next,
              previous: successReloadMessagesPayload.pagination.previous
            })
          );
        });
        it("should set the lastRequest to 'none'", () => {
          expect(reducer(initialState, action).lastRequest).toEqual(none);
        });
      });
    });
  });

  describe("when a `loadNextPageMessages` action is sent", () => {
    const actionRequest = loadNextPageMessages.request({ pageSize: 8 });
    describe(`when a ${getType(loadNextPageMessages.request)} is sent`, () => {
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should reset the state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).data)).toBe(
          true
        );
      });
      it("should set the lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).lastRequest).toEqual(
          some("next")
        );
      });

      describe(`and then a ${getType(
        loadNextPageMessages.success
      )} is sent`, () => {
        const initialState = reducer(undefined, actionRequest);
        const action = loadNextPageMessages.success(
          successLoadNextPageMessagesPayload
        );

        it("should append the payload's content to the existing page", () => {
          const intermediateState = reducer(initialState, action);
          expect(intermediateState.data).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages,
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          // testing for concatenation
          expect(reducer(intermediateState, action).data).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages.concat(
                successLoadNextPageMessagesPayload.messages
              ),
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
        });
        it("should set the lastRequest to 'none'", () => {
          expect(reducer(initialState, action).lastRequest).toEqual(none);
        });
      });
    });
  });

  describe("when a `loadPreviousPageMessages` action is sent", () => {
    const actionRequest = loadPreviousPageMessages.request({ pageSize: 8 });
    describe(`when a ${getType(
      loadPreviousPageMessages.request
    )} is sent`, () => {
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should reset the state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).data)).toBe(
          true
        );
      });
      it("should set the lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).lastRequest).toEqual(
          some("previous")
        );
      });

      describe(`and then a ${getType(
        loadPreviousPageMessages.success
      )} is sent`, () => {
        const initialState = reducer(undefined, actionRequest);
        const action = loadPreviousPageMessages.success(
          successLoadPreviousPageMessagesPayload
        );

        it("should prepend the payload's content to the existing page", () => {
          const intermediateState = reducer(initialState, action);
          expect(intermediateState.data).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages,
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          // testing for prepend
          expect(reducer(intermediateState, action).data).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages.concat(
                successLoadPreviousPageMessagesPayload.messages
              ),
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
        });

        describe("with an empty response", () => {
          // no messages, no cursor
          const actionWithEmptyPagination = loadPreviousPageMessages.success({
            messages: [],
            pagination: {}
          });

          it("should preserve the `previous` cursor", () => {
            const intermediateState = reducer(initialState, action);
            expect(
              reducer(intermediateState, actionWithEmptyPagination).data
            ).toEqual(
              pot.some({
                page: successLoadPreviousPageMessagesPayload.messages,
                previous:
                  successLoadPreviousPageMessagesPayload.pagination.previous
              })
            );
          });
        });

        it("should set the lastRequest to 'none'", () => {
          expect(reducer(initialState, action).lastRequest).toEqual(none);
        });
      });
    });
  });

  describe("when loadPreviousPageMessages and loadNextPageMessages success actions follow each other", () => {
    const initialState: AllPaginated = {
      data: pot.some({
        page: [],
        previous: "abcde",
        next: "12345"
      }),
      lastRequest: none
    };

    it("the loadNext should not affect the existing `previous` cursor", () => {
      const action = loadNextPageMessages.success(
        successLoadNextPageMessagesPayload
      );

      expect(reducer(initialState, action).data).toEqual(
        pot.some({
          page: successLoadNextPageMessagesPayload.messages,
          previous: "abcde",
          next: successLoadNextPageMessagesPayload.pagination.next
        })
      );
    });

    it("the loadPrevious should not affect the existing `next` cursor", () => {
      const action = loadPreviousPageMessages.success(
        successLoadPreviousPageMessagesPayload
      );

      expect(reducer(initialState, action).data).toEqual(
        pot.some({
          page: successLoadPreviousPageMessagesPayload.messages,
          previous: successLoadPreviousPageMessagesPayload.pagination.previous,
          next: "12345"
        })
      );
    });
  });

  [
    [
      reloadAllMessages.request({ pageSize: 8 }),
      reloadAllMessages.failure(new Error("wtf?"))
    ],
    [
      loadNextPageMessages.request({ pageSize: 8 }),
      loadNextPageMessages.failure(new Error("ask Elonk Musk"))
    ],
    [
      loadPreviousPageMessages.request({ pageSize: 8 }),
      loadPreviousPageMessages.failure(new Error("not rich yet?"))
    ]
  ]
    .map(([request, failure]) => ({
      initialState: reducer(undefined, request),
      action: failure
    }))
    .forEach(({ initialState, action }) => {
      const expectedState = pot.noneError((action.payload as Error).message);
      describe(`when a ${action.type} failure is sent`, () => {
        it(`preserves the existing lastRequest: ${initialState.lastRequest}`, () => {
          expect(reducer(initialState, action).lastRequest).toEqual(
            initialState.lastRequest
          );
        });
        it("returns the error", () => {
          expect(reducer(initialState, action).data).toEqual(expectedState);
        });
      });
    });
});

function toGlobalState(localState: AllPaginated): GlobalState {
  return {
    entities: { messages: { allPaginated: localState } }
  } as unknown as GlobalState;
}

describe("isLoadingPreviousPage selector", () => {
  describe("when the state is loading and the last request is 'all'", () => {
    it("should return true", () => {
      expect(
        isLoadingPreviousPage(
          toGlobalState({
            data: pot.noneLoading,
            lastRequest: some("previous")
          })
        )
      ).toBe(true);
    });
  });
});

describe("isLoadingNextPage selector", () => {
  describe("when the state is loading and the last request is 'next'", () => {
    it("should return true", () => {
      expect(
        isLoadingNextPage(
          toGlobalState({ data: pot.noneLoading, lastRequest: some("next") })
        )
      ).toBe(true);
    });
  });

  describe("when the state is not loading and the last request is 'next'", () => {
    it("should return true", () => {
      expect(
        isLoadingNextPage(
          toGlobalState({ data: pot.none, lastRequest: some("next") })
        )
      ).toBe(false);
    });
  });

  describe("when the state is loading and the last request is not 'next'", () => {
    it("should return true", () => {
      expect(
        isLoadingNextPage(
          toGlobalState({ data: pot.none, lastRequest: some("all") })
        )
      ).toBe(false);
    });
  });
});
