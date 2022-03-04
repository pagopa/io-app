import { getType } from "typesafe-actions";
import { none, some } from "fp-ts/lib/Option";
import { pot } from "@pagopa/ts-commons";

import {
  defaultRequestPayload,
  defaultRequestError,
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
  describe("given a `reloadAllMessages` action", () => {
    describe(`when a ${getType(
      reloadAllMessages.request
    )} is sent with filter for Archive`, () => {
      const filter = { getArchived: true };
      const actionRequest = reloadAllMessages.request({
        ...defaultRequestPayload,
        filter
      });
      it("should reset only the Archive state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).inbox)).toBe(
          false
        );
        expect(pot.isLoading(reducer(undefined, actionRequest).archive)).toBe(
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
        const action = reloadAllMessages.success({
          ...successReloadMessagesPayload,
          filter
        });

        it("should reset only the Archive state to the payload's content", () => {
          expect(reducer(initialState, action).inbox).toEqual(pot.none);
          expect(reducer(initialState, action).archive).toEqual(
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

    describe(`when a ${getType(
      reloadAllMessages.request
    )} is sent without a filter`, () => {
      const filter = { getArchived: false };
      const actionRequest = reloadAllMessages.request({
        ...defaultRequestPayload,
        filter
      });
      it("should reset only the Inbox state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).inbox)).toBe(
          true
        );
        expect(pot.isLoading(reducer(undefined, actionRequest).archive)).toBe(
          false
        );
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should set the lastRequest to 'all'", () => {
        expect(reducer(undefined, actionRequest).lastRequest).toEqual(
          some("all")
        );
      });

      describe(`and then a ${getType(
        reloadAllMessages.success
      )} is sent`, () => {
        const initialState = reducer(undefined, actionRequest);
        const action = reloadAllMessages.success({
          ...successReloadMessagesPayload,
          filter
        });

        it("should reset only the Inbox state to the payload's content", () => {
          expect(reducer(initialState, action).inbox).toEqual(
            pot.some({
              page: successReloadMessagesPayload.messages,
              next: successReloadMessagesPayload.pagination.next,
              previous: successReloadMessagesPayload.pagination.previous
            })
          );
          expect(reducer(initialState, action).archive).toEqual(pot.none);
        });
        it("should set the lastRequest to 'none'", () => {
          expect(reducer(initialState, action).lastRequest).toEqual(none);
        });
      });
    });
  });

  describe("given a `loadNextPageMessages` action", () => {
    describe(`when a ${getType(
      loadNextPageMessages.request
    )} is sent with filter for Archive`, () => {
      const filter = { getArchived: true };
      const actionRequest = loadNextPageMessages.request({
        ...defaultRequestPayload,
        filter
      });

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should reset only the Archive state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).inbox)).toBe(
          false
        );
        expect(pot.isLoading(reducer(undefined, actionRequest).archive)).toBe(
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
        const action = loadNextPageMessages.success({
          ...successLoadNextPageMessagesPayload,
          filter
        });

        it("should append the payload's content to the existing Archive page", () => {
          const intermediateState = reducer(initialState, action);
          expect(intermediateState.archive).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages,
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          // testing for concatenation
          const finalState = reducer(intermediateState, action);
          expect(finalState.archive).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages.concat(
                successLoadNextPageMessagesPayload.messages
              ),
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          expect(reducer(initialState, action).inbox).toEqual(pot.none);
        });
        it("should set the lastRequest to 'none'", () => {
          expect(reducer(initialState, action).lastRequest).toEqual(none);
        });
      });
    });

    describe(`when a ${getType(
      loadNextPageMessages.request
    )} is sent without a filter`, () => {
      const filter = { getArchived: false };
      const actionRequest = loadNextPageMessages.request({
        ...defaultRequestPayload,
        filter
      });

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should reset only the Inbox state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).inbox)).toBe(
          true
        );
        expect(pot.isLoading(reducer(undefined, actionRequest).archive)).toBe(
          false
        );
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should set the lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).lastRequest).toEqual(
          some("next")
        );
      });

      describe(`and then a ${getType(
        loadNextPageMessages.success
      )} is sent`, () => {
        const initialState = reducer(undefined, actionRequest);
        const action = loadNextPageMessages.success({
          ...successLoadNextPageMessagesPayload,
          filter
        });

        it("should append the payload's content to the existing Inbox page", () => {
          const intermediateState = reducer(initialState, action);
          expect(intermediateState.inbox).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages,
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          // testing for concatenation
          const finalState = reducer(intermediateState, action);
          expect(finalState.inbox).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages.concat(
                successLoadNextPageMessagesPayload.messages
              ),
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          expect(reducer(initialState, action).archive).toEqual(pot.none);
        });
        it("should set the lastRequest to 'none'", () => {
          expect(reducer(initialState, action).lastRequest).toEqual(none);
        });
      });
    });
  });

  describe("given a `loadPreviousPageMessages` action", () => {
    describe(`when a ${getType(
      loadPreviousPageMessages.request
    )} is sent with filter for Archive`, () => {
      const filter = { getArchived: true };
      const actionRequest = loadPreviousPageMessages.request({
        ...defaultRequestPayload,
        filter
      });

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should reset only the Archive state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).inbox)).toBe(
          false
        );
        expect(pot.isLoading(reducer(undefined, actionRequest).archive)).toBe(
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
        const action = loadPreviousPageMessages.success({
          ...successLoadPreviousPageMessagesPayload,
          filter
        });

        it("should prepend the payload's content to the existing Archive page", () => {
          const intermediateState = reducer(initialState, action);
          expect(intermediateState.archive).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages,
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          const finalState = reducer(intermediateState, action);
          // testing for prepend
          expect(finalState.archive).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages.concat(
                successLoadPreviousPageMessagesPayload.messages
              ),
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          expect(finalState.inbox).toEqual(pot.none);
        });

        describe("with an empty response", () => {
          // no messages, no cursor
          const actionWithEmptyPagination = loadPreviousPageMessages.success({
            messages: [],
            pagination: {},
            filter
          });

          it("should preserve the `previous` Archive cursor", () => {
            const intermediateState = reducer(initialState, action);
            const finalState = reducer(
              intermediateState,
              actionWithEmptyPagination
            );
            expect(finalState.inbox).toEqual(pot.none);
            expect(finalState.archive).toEqual(
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

    describe(`when a ${getType(
      loadPreviousPageMessages.request
    )} is sent without filter`, () => {
      const filter = { getArchived: false };
      const actionRequest = loadPreviousPageMessages.request({
        ...defaultRequestPayload,
        filter
      });

      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should reset only the Inbox state to loading", () => {
        expect(pot.isLoading(reducer(undefined, actionRequest).inbox)).toBe(
          true
        );
        expect(pot.isLoading(reducer(undefined, actionRequest).archive)).toBe(
          false
        );
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should set the lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).lastRequest).toEqual(
          some("previous")
        );
      });

      describe(`and then a ${getType(
        loadPreviousPageMessages.success
      )} is sent`, () => {
        const initialState = reducer(undefined, actionRequest);
        const action = loadPreviousPageMessages.success({
          ...successLoadPreviousPageMessagesPayload,
          filter
        });

        it("should prepend the payload's content to the existing page Inbox", () => {
          const intermediateState = reducer(initialState, action);
          expect(intermediateState.inbox).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages,
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          const finalState = reducer(intermediateState, action);
          // testing for prepend
          expect(finalState.inbox).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages.concat(
                successLoadPreviousPageMessagesPayload.messages
              ),
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          expect(finalState.archive).toEqual(pot.none);
        });

        describe("with an empty response", () => {
          // no messages, no cursor
          const actionWithEmptyPagination = loadPreviousPageMessages.success({
            messages: [],
            pagination: {},
            filter
          });

          it("should preserve the `previous` Inbox cursor", () => {
            const intermediateState = reducer(initialState, action);
            const finalState = reducer(
              intermediateState,
              actionWithEmptyPagination
            );
            expect(finalState.inbox).toEqual(
              pot.some({
                page: successLoadPreviousPageMessagesPayload.messages,
                previous:
                  successLoadPreviousPageMessagesPayload.pagination.previous
              })
            );
            expect(finalState.archive).toEqual(pot.none);
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
      archive: pot.none,
      inbox: pot.some({
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

      expect(reducer(initialState, action).inbox).toEqual(
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

      expect(reducer(initialState, action).inbox).toEqual(
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
      reloadAllMessages.request(defaultRequestPayload),
      reloadAllMessages.failure(defaultRequestError)
    ],
    [
      loadNextPageMessages.request(defaultRequestPayload),
      loadNextPageMessages.failure(defaultRequestError)
    ],
    [
      loadPreviousPageMessages.request(defaultRequestPayload),
      loadPreviousPageMessages.failure(defaultRequestError)
    ]
  ]
    .map(([request, failure]) => ({
      initialState: reducer(undefined, request),
      action: failure
    }))
    .forEach(({ initialState, action }) => {
      const expectedState = pot.noneError(defaultRequestError.error.message);
      describe(`when a ${action.type} failure is sent`, () => {
        it(`preserves the existing lastRequest: ${initialState.lastRequest}`, () => {
          expect(reducer(initialState, action).lastRequest).toEqual(
            initialState.lastRequest
          );
        });
        it("returns the error", () => {
          expect(reducer(initialState, action).inbox).toEqual(expectedState);
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
  [
    // pots say loading but there is no last request
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: none,
      expected: false
    },
    // pots say none and there is no last request
    {
      archive: pot.none,
      data: pot.none,
      lastRequest: none,
      expected: false
    },
    // pots say loading and it was a previous page
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: some("previous"),
      expected: true
    },
    // pots say different things and it was a previous page
    {
      archive: pot.noneLoading,
      data: pot.none,
      lastRequest: some("previous"),
      expected: true
    },
    // pots say loading and it was something else
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: some("next"),
      expected: false
    },
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: some("all"),
      expected: false
    }
  ].forEach(({ archive, data, lastRequest, expected }) => {
    describe(`given { archive: ${archive.kind}, inbox: ${
      data.kind
    }, lastRequest: ${lastRequest.toString()} `, () => {
      it(`should return ${expected}`, () => {
        expect(
          isLoadingPreviousPage(
            toGlobalState({
              archive,
              inbox: data,
              lastRequest: lastRequest as AllPaginated["lastRequest"]
            })
          )
        ).toBe(expected);
      });
    });
  });
});

describe("isLoadingNextPage selector", () => {
  [
    // pots say loading but there is no last request
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: none,
      expected: false
    },
    // pots say none and there is no last request
    {
      archive: pot.none,
      data: pot.none,
      lastRequest: none,
      expected: false
    },
    // pots say loading and it was a next page
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: some("next"),
      expected: true
    },
    // pots say different things and it was a next page
    {
      archive: pot.noneLoading,
      data: pot.none,
      lastRequest: some("next"),
      expected: true
    },
    // pots say loading and it was something else
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: some("previous"),
      expected: false
    },
    {
      archive: pot.noneLoading,
      data: pot.noneLoading,
      lastRequest: some("all"),
      expected: false
    }
  ].forEach(({ archive, data, lastRequest, expected }) => {
    describe(`given { archive: ${archive.kind}, inbox: ${
      data.kind
    }, lastRequest: ${lastRequest.toString()} `, () => {
      it(`should return ${expected}`, () => {
        expect(
          isLoadingNextPage(
            toGlobalState({
              archive,
              inbox: data,
              lastRequest: lastRequest as AllPaginated["lastRequest"]
            })
          )
        ).toBe(expected);
      });
    });
  });
});
