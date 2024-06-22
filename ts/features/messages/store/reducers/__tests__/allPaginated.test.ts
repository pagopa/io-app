import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  defaultRequestPayload,
  defaultRequestError,
  successLoadNextPageMessagesPayload,
  successLoadPreviousPageMessagesPayload,
  successReloadMessagesPayload
} from "../../../__mocks__/messages";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  migrateToPaginatedMessages,
  reloadAllMessages,
  resetMigrationStatus,
  setShownMessageCategoryAction,
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../actions";
import { GlobalState } from "../../../../../store/reducers/types";
import reducer, {
  isLoadingArchivePreviousPage,
  isLoadingArchiveNextPage,
  isLoadingInboxPreviousPage,
  AllPaginated,
  isLoadingInboxNextPage,
  isLoadingOrUpdatingInbox,
  shownMessageCategorySelector,
  MessagePagePot,
  messageListForCategorySelector,
  MessagePage,
  messagesByCategorySelector,
  emptyListReasonSelector,
  shouldShowFooterListComponentSelector,
  LastRequestType,
  messagePagePotFromCategorySelector,
  shouldShowRefreshControllOnListSelector
} from "../allPaginated";
import { pageSize } from "../../../../../config";
import { UIMessage } from "../../../types";
import { clearCache } from "../../../../../store/actions/profile";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { MessageListCategory } from "../../../types/messageListCategory";
import { emptyMessageArray } from "../../../utils";
import { isSomeLoadingOrSomeUpdating } from "../../../../../utils/pot";

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
        expect(
          pot.isLoading(reducer(undefined, actionRequest).inbox.data)
        ).toBe(false);
        expect(
          pot.isLoading(reducer(undefined, actionRequest).archive.data)
        ).toBe(true);
      });
      it("should set the Archive lastRequest to 'all'", () => {
        expect(reducer(undefined, actionRequest).archive.lastRequest).toEqual(
          O.some("all")
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
          expect(reducer(initialState, action).inbox.data).toEqual(pot.none);
          expect(reducer(initialState, action).archive.data).toEqual(
            pot.some({
              page: successReloadMessagesPayload.messages,
              next: successReloadMessagesPayload.pagination.next,
              previous: successReloadMessagesPayload.pagination.previous
            })
          );
        });
        it("should set the Archive lastRequest to 'none'", () => {
          expect(reducer(initialState, action).archive.lastRequest).toEqual(
            O.none
          );
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
        expect(
          pot.isLoading(reducer(undefined, actionRequest).inbox.data)
        ).toBe(true);
        expect(
          pot.isLoading(reducer(undefined, actionRequest).archive.data)
        ).toBe(false);
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should set the Inbox lastRequest to 'all'", () => {
        expect(reducer(undefined, actionRequest).inbox.lastRequest).toEqual(
          O.some("all")
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
          expect(reducer(initialState, action).inbox.data).toEqual(
            pot.some({
              page: successReloadMessagesPayload.messages,
              next: successReloadMessagesPayload.pagination.next,
              previous: successReloadMessagesPayload.pagination.previous
            })
          );
          expect(reducer(initialState, action).archive.data).toEqual(pot.none);
        });
        it("should set the Inbox lastRequest to 'none'", () => {
          expect(reducer(initialState, action).inbox.lastRequest).toEqual(
            O.none
          );
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
        expect(
          pot.isLoading(reducer(undefined, actionRequest).inbox.data)
        ).toBe(false);
        expect(
          pot.isLoading(reducer(undefined, actionRequest).archive.data)
        ).toBe(true);
      });
      it("should set the Archive lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).archive.lastRequest).toEqual(
          O.some("next")
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
          expect(intermediateState.archive.data).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages,
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          // testing for concatenation
          const finalState = reducer(intermediateState, action);
          expect(finalState.archive.data).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages.concat(
                successLoadNextPageMessagesPayload.messages
              ),
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          expect(reducer(initialState, action).inbox.data).toEqual(pot.none);
        });
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should set the Archive lastRequest to 'none'", () => {
          expect(reducer(initialState, action).archive.lastRequest).toEqual(
            O.none
          );
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
        expect(
          pot.isLoading(reducer(undefined, actionRequest).inbox.data)
        ).toBe(true);
        expect(
          pot.isLoading(reducer(undefined, actionRequest).archive.data)
        ).toBe(false);
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should set the Inbox lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).inbox.lastRequest).toEqual(
          O.some("next")
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
          expect(intermediateState.inbox.data).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages,
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          // testing for concatenation
          const finalState = reducer(intermediateState, action);
          expect(finalState.inbox.data).toEqual(
            pot.some({
              page: successLoadNextPageMessagesPayload.messages.concat(
                successLoadNextPageMessagesPayload.messages
              ),
              next: successLoadNextPageMessagesPayload.pagination.next
            })
          );
          expect(reducer(initialState, action).archive.data).toEqual(pot.none);
        });
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should set the Inbox lastRequest to 'none'", () => {
          expect(reducer(initialState, action).inbox.lastRequest).toEqual(
            O.none
          );
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
        expect(
          pot.isLoading(reducer(undefined, actionRequest).inbox.data)
        ).toBe(false);
        expect(
          pot.isLoading(reducer(undefined, actionRequest).archive.data)
        ).toBe(true);
      });
      it("should set the Archive lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).archive.lastRequest).toEqual(
          O.some("previous")
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
          expect(intermediateState.archive.data).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages,
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          const finalState = reducer(intermediateState, action);
          // testing for prepend
          expect(finalState.archive.data).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages.concat(
                successLoadPreviousPageMessagesPayload.messages
              ),
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          expect(finalState.inbox.data).toEqual(pot.none);
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
            expect(finalState.inbox.data).toEqual(pot.none);
            expect(finalState.archive.data).toEqual(
              pot.some({
                page: successLoadPreviousPageMessagesPayload.messages,
                previous:
                  successLoadPreviousPageMessagesPayload.pagination.previous
              })
            );
          });
        });

        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should set the Archive lastRequest to 'none'", () => {
          expect(reducer(initialState, action).archive.lastRequest).toEqual(
            O.none
          );
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
        expect(
          pot.isLoading(reducer(undefined, actionRequest).inbox.data)
        ).toBe(true);
        expect(
          pot.isLoading(reducer(undefined, actionRequest).archive.data)
        ).toBe(false);
      });
      // eslint-disable-next-line sonarjs/no-identical-functions
      it("should set the Inbox lastRequest to `next'", () => {
        expect(reducer(undefined, actionRequest).inbox.lastRequest).toEqual(
          O.some("previous")
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
          expect(intermediateState.inbox.data).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages,
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          const finalState = reducer(intermediateState, action);
          // testing for prepend
          expect(finalState.inbox.data).toEqual(
            pot.some({
              page: successLoadPreviousPageMessagesPayload.messages.concat(
                successLoadPreviousPageMessagesPayload.messages
              ),
              previous:
                successLoadPreviousPageMessagesPayload.pagination.previous
            })
          );
          expect(finalState.archive.data).toEqual(pot.none);
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
            expect(finalState.inbox.data).toEqual(
              pot.some({
                page: successLoadPreviousPageMessagesPayload.messages,
                previous:
                  successLoadPreviousPageMessagesPayload.pagination.previous
              })
            );
            expect(finalState.archive.data).toEqual(pot.none);
          });
        });

        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should set the Inbox lastRequest to 'none'", () => {
          expect(reducer(initialState, action).inbox.lastRequest).toEqual(
            O.none
          );
        });
      });
    });
  });

  describe("when loadPreviousPageMessages and loadNextPageMessages success actions follow each other", () => {
    const initialState: AllPaginated = {
      ...defaultState,
      inbox: {
        data: pot.some({
          page: [],
          previous: "abcde",
          next: "12345"
        }),
        lastRequest: O.none
      }
    };

    it("the loadNext should not affect the existing `previous` cursor", () => {
      const action = loadNextPageMessages.success(
        successLoadNextPageMessagesPayload
      );

      expect(reducer(initialState, action).inbox.data).toEqual(
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

      expect(reducer(initialState, action).inbox.data).toEqual(
        pot.some({
          page: successLoadPreviousPageMessagesPayload.messages,
          previous: successLoadPreviousPageMessagesPayload.pagination.previous,
          next: "12345"
        })
      );
    });
  });

  describe("when `setShownMessageCategoryAction` is received", () => {
    it("should change from INBOX to ARCHIVE", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("INBOX");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should change from ARCHIVE to INBOX", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("ARCHIVE");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("INBOX");
    });
    it("should stay ARCHIVE", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("ARCHIVE");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should stay INBOX", () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("INBOX");
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState,
        setShownMessageCategoryAction("INBOX")
      );
      expect(allPaginatedFinalState.shownCategory).toBe("INBOX");
    });
  });

  describe("when an action that is not `setShownMessageCategoryAction` is received", () => {
    const allPaginatedInitialState = () => {
      const allPaginatedInitialState = reducer(
        undefined,
        setShownMessageCategoryAction("ARCHIVE")
      );
      expect(allPaginatedInitialState.shownCategory).toBe("ARCHIVE");
      return allPaginatedInitialState;
    };
    it("should keep its `showCategory` value (reloadAllMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        reloadAllMessages.request({ pageSize, filter: { getArchived: true } })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (reloadAllMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        reloadAllMessages.success({
          messages: [],
          filter: { getArchived: true },
          pagination: {}
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (reloadAllMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        reloadAllMessages.failure({
          error: new Error(""),
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (loadNextPageMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        loadNextPageMessages.request({
          pageSize,
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadNextPageMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        loadNextPageMessages.success({
          messages: [],
          filter: { getArchived: true },
          pagination: {}
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadNextPageMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        loadNextPageMessages.failure({
          error: new Error(""),
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (loadPreviousPageMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        loadPreviousPageMessages.request({
          pageSize,
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadPreviousPageMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        loadPreviousPageMessages.success({
          messages: [],
          filter: { getArchived: true },
          pagination: {}
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (loadPreviousPageMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        loadPreviousPageMessages.failure({
          error: new Error(""),
          filter: { getArchived: true }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (upsertMessageStatusAttributes.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        upsertMessageStatusAttributes.request({
          message: { isRead: true } as UIMessage,
          update: { isArchived: false, tag: "bulk" }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (upsertMessageStatusAttributes.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        upsertMessageStatusAttributes.success({
          message: { isRead: true } as UIMessage,
          update: { isArchived: false, tag: "bulk" }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (upsertMessageStatusAttributes.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        upsertMessageStatusAttributes.failure({
          error: new Error(""),
          payload: {
            message: { isRead: true } as UIMessage,
            update: { isArchived: false, tag: "bulk" }
          }
        })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (migrateToPaginatedMessages.request)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        migrateToPaginatedMessages.request({})
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (migrateToPaginatedMessages.success)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        migrateToPaginatedMessages.success(0)
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });
    it("should keep its `showCategory` value (migrateToPaginatedMessages.failure)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        migrateToPaginatedMessages.failure({ failed: [], succeeded: [] })
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (resetMigrationStatus)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        resetMigrationStatus()
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
    });

    it("should keep its `showCategory` value (clearCache)", () => {
      const allPaginatedFinalState = reducer(
        allPaginatedInitialState(),
        clearCache()
      );
      expect(allPaginatedFinalState.shownCategory).toBe("ARCHIVE");
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
      describe(`when a ${action.type} failure is sent`, () => {
        it(`preserves the existing lastRequest: ${initialState.inbox.lastRequest}`, () => {
          expect(reducer(initialState, action).inbox.lastRequest).toEqual(
            initialState.inbox.lastRequest
          );
        });
        it("returns the error", () => {
          const output = reducer(initialState, action).inbox.data;
          const errorReason = pot.isError(output)
            ? output.error.reason
            : undefined;
          expect(pot.isError(output)).toBe(true);
          expect(errorReason).toBe(defaultRequestError.error.message);
        });
      });
    });
});

const defaultState: AllPaginated = {
  inbox: { data: pot.none, lastRequest: O.none },
  archive: { data: pot.none, lastRequest: O.none },
  migration: O.none,
  shownCategory: "INBOX"
};

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
      inbox: pot.noneLoading,
      lastRequest: O.none,
      expectedArchive: false,
      expectedInbox: false
    },
    // pots say none and there is no last request
    {
      archive: pot.none,
      inbox: pot.none,
      lastRequest: O.none,
      expectedArchive: false,
      expectedInbox: false
    },
    // pots say loading and it was a previous page
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.some("previous"),
      expectedArchive: true,
      expectedInbox: true
    },
    // pots say different things and it was a previous page
    {
      archive: pot.noneLoading,
      inbox: pot.none,
      lastRequest: O.some("previous"),
      expectedArchive: true,
      expectedInbox: false
    },
    // pots say loading and it was something else
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.some("next"),
      expectedArchive: false,
      expectedInbox: false
    },
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.some("all"),
      expectedArchive: false,
      expectedInbox: false
    }
  ].forEach(
    ({ archive, inbox, lastRequest, expectedArchive, expectedInbox }) => {
      describe(`given { archive: ${archive.kind}, inbox: ${
        inbox.kind
      }, lastRequest: ${lastRequest.toString()} `, () => {
        it(`should return ${expectedInbox} for inbox`, () => {
          expect(
            isLoadingInboxPreviousPage(
              toGlobalState({
                ...defaultState,
                archive: {
                  data: archive,
                  lastRequest:
                    lastRequest as AllPaginated["archive"]["lastRequest"]
                },
                inbox: {
                  data: inbox,
                  lastRequest:
                    lastRequest as AllPaginated["inbox"]["lastRequest"]
                }
              })
            )
          ).toBe(expectedInbox);
        });

        it(`should return ${expectedArchive} for archive`, () => {
          expect(
            isLoadingArchivePreviousPage(
              toGlobalState({
                ...defaultState,
                archive: {
                  data: archive,
                  lastRequest:
                    lastRequest as AllPaginated["archive"]["lastRequest"]
                },
                inbox: {
                  data: inbox,
                  lastRequest:
                    lastRequest as AllPaginated["inbox"]["lastRequest"]
                }
              })
            )
          ).toBe(expectedArchive);
        });
      });
    }
  );
});

describe("isLoadingNextPage selector", () => {
  [
    // pots say loading but there is no last request
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.none,
      expectedArchive: false,
      expectedInbox: false
    },
    // pots say none and there is no last request
    {
      archive: pot.none,
      inbox: pot.none,
      lastRequest: O.none,
      expectedArchive: false,
      expectedInbox: false
    },
    // pots say loading and it was a next page
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.some("next"),
      expectedArchive: true,
      expectedInbox: true
    },
    // pots say different things and it was a next page
    {
      archive: pot.noneLoading,
      inbox: pot.none,
      lastRequest: O.some("next"),
      expectedArchive: true,
      expectedInbox: false
    },
    // pots say loading and it was something else
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.some("previous"),
      expectedArchive: false,
      expectedInbox: false
    },
    {
      archive: pot.noneLoading,
      inbox: pot.noneLoading,
      lastRequest: O.some("all"),
      expectedArchive: false,
      expectedInbox: false
    }
  ].forEach(
    ({ archive, inbox, lastRequest, expectedArchive, expectedInbox }) => {
      describe(`given { archive: ${archive.kind}, inbox: ${
        inbox.kind
      }, lastRequest: ${lastRequest.toString()} `, () => {
        it(`should return ${expectedInbox} for inbox`, () => {
          expect(
            isLoadingInboxNextPage(
              toGlobalState({
                ...defaultState,
                archive: {
                  data: archive,
                  lastRequest:
                    lastRequest as AllPaginated["archive"]["lastRequest"]
                },
                inbox: {
                  data: inbox,
                  lastRequest:
                    lastRequest as AllPaginated["inbox"]["lastRequest"]
                }
              })
            )
          ).toBe(expectedInbox);
        });

        it(`should return ${expectedArchive} for archive`, () => {
          expect(
            isLoadingArchiveNextPage(
              toGlobalState({
                ...defaultState,
                archive: {
                  data: archive,
                  lastRequest:
                    lastRequest as AllPaginated["archive"]["lastRequest"]
                },
                inbox: {
                  data: inbox,
                  lastRequest:
                    lastRequest as AllPaginated["inbox"]["lastRequest"]
                }
              })
            )
          ).toBe(expectedArchive);
        });
      });
    }
  );
});

describe("isLoadingOrUpdatingInbox selector", () => {
  [
    {
      inbox: pot.none,
      expectedReturn: false
    },
    {
      inbox: pot.noneError({ reason: "", time: new Date() }),
      expectedReturn: false
    },
    {
      inbox: pot.some({
        page: []
      }),
      expectedReturn: false
    },
    {
      inbox: pot.someError(
        {
          page: []
        },
        { reason: "", time: new Date() }
      ),
      expectedReturn: false
    },
    {
      inbox: pot.noneLoading,
      expectedReturn: true
    },
    {
      inbox: pot.noneUpdating({
        page: []
      }),
      expectedReturn: true
    },
    {
      inbox: pot.someLoading({
        page: []
      }),
      expectedReturn: true
    },
    {
      inbox: pot.someUpdating(
        {
          page: []
        },
        {
          page: []
        }
      ),
      expectedReturn: true
    }
  ].forEach(({ inbox, expectedReturn }) => {
    describe(`given { inbox: ${inbox.kind} }`, () => {
      it(`should return ${expectedReturn}`, () => {
        expect(
          isLoadingOrUpdatingInbox(
            toGlobalState({
              ...defaultState,
              inbox: {
                data: inbox,
                lastRequest: O.none
              }
            })
          )
        ).toBe(expectedReturn);
      });
    });
  });
});

describe("Message state upsert", () => {
  const A = successReloadMessagesPayload.messages[0];
  const B = successReloadMessagesPayload.messages[1];
  const C = successReloadMessagesPayload.messages[2];

  [
    {
      given: {
        desc: "given a pot.none archive",
        inbox: pot.some({
          page: [A],
          previous: A.id,
          next: undefined
        }),
        archive: pot.none
      },
      when: {
        desc: "when archiving a message",
        message: A,
        update: { tag: "archiving", isArchived: true }
      },
      then: {
        desc: "then the message is deleted from inbox and archive remains unchanged",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.none
      }
    },

    {
      given: {
        desc: "given an empty archive",
        inbox: pot.some({
          page: [A],
          previous: A.id,
          next: undefined
        }),
        archive: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        })
      },
      when: {
        desc: "when archiving a message",
        message: A,
        update: { tag: "archiving", isArchived: true }
      },
      then: {
        desc: "then the message is moved from inbox to archive and cursors updated",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.some({
          page: [{ ...A, isArchived: true }],
          previous: A.id,
          next: undefined
        })
      }
    },

    {
      given: {
        desc: "given a partially fetched archive",
        inbox: pot.some({
          page: [A],
          previous: A.id,
          next: undefined
        }),
        archive: pot.some({
          page: [B, C],
          previous: B.id,
          next: C.id
        })
      },
      when: {
        desc: "when archiving a message newer than the archived ones",
        message: A,
        update: { tag: "archiving", isArchived: true }
      },
      then: {
        desc: "then the message is moved from inbox to archive and cursors updated",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.some({
          page: [{ ...A, isArchived: true }, B, C],
          previous: A.id,
          next: C.id
        })
      }
    },

    {
      given: {
        desc: "given a partially fetched archive",
        inbox: pot.some({
          page: [C],
          previous: C.id,
          next: undefined
        }),
        archive: pot.some({
          page: [A, B],
          previous: A.id,
          next: B.id
        })
      },
      when: {
        desc: "when archiving a message older than the archived ones",
        message: C,
        update: { tag: "archiving", isArchived: true }
      },
      then: {
        desc: "then the message is removed from inbox and archive remains unchanged",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.some({
          page: [A, B],
          previous: A.id,
          next: B.id
        })
      }
    },

    {
      given: {
        desc: "given a partially fetched archive",
        inbox: pot.some({
          page: [B],
          previous: B.id,
          next: undefined
        }),
        archive: pot.some({
          page: [A, C],
          previous: A.id,
          next: C.id
        })
      },
      when: {
        desc: "when archiving a message neither newer nor older than the archived ones",
        message: B,
        update: { tag: "archiving", isArchived: true }
      },
      then: {
        desc: "then the message is moved from inbox to archive and archive cursors remain unchanged",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.some({
          page: [A, { ...B, isArchived: true }, C],
          previous: A.id,
          next: C.id
        })
      }
    },

    {
      given: {
        desc: "given a fully fetched archive",
        inbox: pot.some({
          page: [C],
          previous: C.id,
          next: undefined
        }),
        archive: pot.some({
          page: [A, B],
          previous: A.id,
          next: undefined
        })
      },
      when: {
        desc: "when archiving a message older than the archived ones",
        message: C,
        update: { tag: "archiving", isArchived: true }
      },
      then: {
        desc: "then the message is moved from inbox to archive and next cursor remains undefined",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.some({
          page: [A, B, { ...C, isArchived: true }],
          previous: A.id,
          next: undefined
        })
      }
    },
    {
      given: {
        desc: "given an unread message in inbox",
        inbox: pot.some({
          page: [{ ...A, isRead: false }],
          previous: A.id,
          next: undefined
        }),
        archive: pot.none
      },
      when: {
        desc: "when reading the message",
        message: { ...A, isRead: false },
        update: { tag: "reading" }
      },
      then: {
        desc: "then the message state is updated accordingly",
        expectedInbox: pot.some({
          page: [{ ...A, isRead: true }],
          previous: A.id,
          next: undefined
        }),
        expectedArchive: pot.none
      }
    },
    {
      given: {
        desc: "given an unread message in inbox",
        inbox: pot.some({
          page: [{ ...A, isRead: false, isArchived: false }],
          previous: A.id,
          next: undefined
        }),
        archive: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        })
      },
      when: {
        desc: "when reading and archiving the message",
        message: { ...A, isRead: false, isArchived: false },
        update: { tag: "bulk", isArchived: true }
      },
      then: {
        desc: "then the message state is updated accordingly",
        expectedInbox: pot.some({
          page: [],
          previous: undefined,
          next: undefined
        }),
        expectedArchive: pot.some({
          page: [{ ...A, isRead: true, isArchived: true }],
          previous: A.id,
          next: undefined
        })
      }
    }
  ].forEach(({ given, when, then }) => {
    describe(`${given.desc}`, () => {
      const initialState = {
        ...defaultState,
        inbox: { ...defaultState.inbox, data: given.inbox },
        archive: { ...defaultState.archive, data: given.archive }
      };

      describe(`${when.desc}`, () => {
        const payload: UpsertMessageStatusAttributesPayload = {
          message: when.message,
          update: when.update as UpsertMessageStatusAttributesPayload["update"]
        };

        const requestState = reducer(
          initialState,
          upsertMessageStatusAttributes.request(payload)
        );

        it(`${then.desc}`, () => {
          expect(requestState.archive.data).toEqual(then.expectedArchive);
          expect(requestState.inbox.data).toEqual(then.expectedInbox);
        });

        describe(`and the request succeeds`, () => {
          const successState = reducer(
            requestState,
            upsertMessageStatusAttributes.success(payload)
          );
          it(`archive and inbox keep their request state`, () => {
            expect(successState.archive.data).toEqual(then.expectedArchive);
            expect(successState.inbox.data).toEqual(then.expectedInbox);
          });
        });

        describe(`and the request fails`, () => {
          const failureState = reducer(
            requestState,
            upsertMessageStatusAttributes.failure({
              error: new Error(),
              payload
            })
          );
          it(`archive and inbox are reverted to their original state`, () => {
            expect(failureState.archive.data).toEqual(given.archive);
            expect(failureState.inbox.data).toEqual(given.inbox);
          });
        });
      });
    });
  });
});

describe("shownMessageCategorySelector", () => {
  it("should return INBOX for the initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const shownCategory = shownMessageCategorySelector(globalState);
    expect(shownCategory).toBe("INBOX");
  });
  it("should return INBOX when shownCategory is INBOX", () => {
    const globalState = appReducer(
      undefined,
      setShownMessageCategoryAction("INBOX")
    );
    const shownCategory = shownMessageCategorySelector(globalState);
    expect(shownCategory).toBe("INBOX");
  });
  it("should return ARCHIVE when shownCategory is ARCHIVE", () => {
    const globalState = appReducer(
      undefined,
      setShownMessageCategoryAction("ARCHIVE")
    );
    const shownCategory = shownMessageCategorySelector(globalState);
    expect(shownCategory).toBe("ARCHIVE");
  });
});

describe("messageListForCategorySelector", () => {
  const categories: ReadonlyArray<MessageListCategory> = ["INBOX", "ARCHIVE"];
  categories.forEach(category => {
    it(`for ${category} category, data pot.none, should return emptyMessageArray reference`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.none
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(emptyMessageArray);
    });
    it(`for ${category} category, data pot.noneLoading, should return undefined`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.noneLoading
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBeUndefined();
    });
    it(`for ${category} category, data pot.noneUpdating, should return undefined`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.noneUpdating({} as MessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBeUndefined();
    });
    it(`for ${category} category, data pot.noneError, should return emptyMessageArray reference`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.noneError({ reason: "", time: new Date() })
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(emptyMessageArray);
    });
    it(`for ${category} category, data pot.some, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.some(nonEmptyMessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
    it(`for ${category} category, data pot.someLoading, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.someLoading(nonEmptyMessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
    it(`for ${category} category, data pot.someUpdating, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.someUpdating(nonEmptyMessagePage, {} as MessagePage)
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
    it(`for ${category} category, data pot.someError, should return the message list`, () => {
      const state = generateAllPaginatedDataStateForCategory(
        category,
        pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
      );
      const messageList = messageListForCategorySelector(state, category);
      expect(messageList).toBe(readonlyNonEmptyMessageList);
    });
  });
});

describe("messagesByCategorySelector", () => {
  it("should return inbox message page pot for INBOX category", () => {
    const inputMessagePagePot = pot.some(nonEmptyMessagePage);
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      inputMessagePagePot
    );
    const messagePagePot = messagesByCategorySelector(state, "INBOX");
    expect(messagePagePot).toBe(inputMessagePagePot);
  });
  it("should return archive message page pot for ARCHIVE category", () => {
    const inputMessagePagePot = pot.some(nonEmptyMessagePage);
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      inputMessagePagePot
    );
    const messagePagePot = messagesByCategorySelector(state, "ARCHIVE");
    expect(messagePagePot).toBe(inputMessagePagePot);
  });
});

describe("emptyListReasonSelector", () => {
  it("should return 'noData' for INBOX category when inbox message collection is pot.none", () => {
    const state = generateAllPaginatedDataStateForCategory("INBOX", pot.none);
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.noneLoading", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.noneLoading
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.noneUpdating", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.noneUpdating(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'error' for INBOX category when inbox message collection is pot.noneError", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.noneError({ reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("error");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.some with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.some(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.some with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.some(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.someLoading with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someLoading(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.someLoading with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someLoading(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.someUpdating with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someUpdating(emptyMessagePage, nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.someUpdating with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someUpdating(nonEmptyMessagePage, emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for INBOX category when inbox message collection is pot.someError with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someError(emptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for INBOX category when inbox message collection is pot.someError with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "INBOX",
      pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "INBOX");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.none", () => {
    const state = generateAllPaginatedDataStateForCategory("ARCHIVE", pot.none);
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.noneLoading", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.noneLoading
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.noneUpdating", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.noneUpdating(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'error' for ARCHIVE category when inbox message collection is pot.noneError", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.noneError({ reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("error");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.some with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.some(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.some with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.some(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.someLoading with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someLoading(emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.someLoading with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someLoading(nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.someUpdating with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someUpdating(emptyMessagePage, nonEmptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.someUpdating with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someUpdating(nonEmptyMessagePage, emptyMessagePage)
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
  it("should return 'noData' for ARCHIVE category when inbox message collection is pot.someError with no data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someError(emptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("noData");
  });
  it("should return 'notEmpty' for ARCHIVE category when inbox message collection is pot.someError with data", () => {
    const state = generateAllPaginatedDataStateForCategory(
      "ARCHIVE",
      pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
    );
    const reason = emptyListReasonSelector(state, "ARCHIVE");
    expect(reason).toBe("notEmpty");
  });
});

describe("shouldShowFooterListComponentSelector", () => {
  const categories: Array<MessageListCategory> = ["INBOX", "ARCHIVE"];
  const messagePagePots: Array<MessagePagePot> = [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(emptyMessagePage),
    pot.noneError({ reason: "", time: new Date() }),
    pot.some(nonEmptyMessagePage),
    pot.someLoading(nonEmptyMessagePage),
    pot.someUpdating(nonEmptyMessagePage, emptyMessagePage),
    pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
  ];
  const lastRequests: Array<LastRequestType> = [
    O.some("all"),
    O.some("next"),
    O.some("previous"),
    O.none
  ];
  categories.forEach(category =>
    lastRequests.forEach(lastRequest =>
      messagePagePots.forEach(messagePagePot => {
        const footerIsVisible =
          O.isSome(lastRequest) &&
          lastRequest.value === "next" &&
          isSomeLoadingOrSomeUpdating(messagePagePot);
        it(`Footer should be ${
          footerIsVisible ? "visible" : "hidden"
        }, ${category}, '${
          O.isSome(lastRequest) ? lastRequest.value : "none"
        }' lastRequest, ${messagePagePot.kind}`, () => {
          const state = generateAllPaginatedDataStateForCategory(
            category,
            messagePagePot,
            lastRequest
          );
          const shouldShowFooterListComponent =
            shouldShowFooterListComponentSelector(state, category);
          expect(shouldShowFooterListComponent).toBe(footerIsVisible);
        });
      })
    )
  );
});

describe("messagePagePotFromCategorySelector", () => {
  it("should return messagePagePot, INBOX category", () => {
    const category: MessageListCategory = "INBOX";
    const messagePagePot = pot.some({} as MessagePage);
    const state = generateAllPaginatedDataStateForCategory(
      category,
      messagePagePot
    );
    const outputMessagePagePot =
      messagePagePotFromCategorySelector(category)(state);
    expect(outputMessagePagePot).toStrictEqual(messagePagePot);
  });
});

describe("shouldShowRefreshControllOnListSelector", () => {
  const categories: ReadonlyArray<MessageListCategory> = ["INBOX", "ARCHIVE"];
  const messagePagePotData: ReadonlyArray<MessagePagePot> = [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(nonEmptyMessagePage),
    pot.noneError({ reason: "", time: new Date() }),
    pot.some(nonEmptyMessagePage),
    pot.someLoading(nonEmptyMessagePage),
    pot.someUpdating(nonEmptyMessagePage, emptyMessagePage),
    pot.someError(nonEmptyMessagePage, { reason: "", time: new Date() })
  ];
  const messageRequests: ReadonlyArray<LastRequestType> = [
    O.some("next"),
    O.some("previous"),
    O.some("all"),
    O.none
  ];

  categories.forEach(category =>
    messagePagePotData.forEach(messagePagePot =>
      messageRequests.forEach(messageRequest => {
        // eslint-disable-next-line no-underscore-dangle
        const expectedOutput =
          (messagePagePot.kind === "PotSomeLoading" ||
            messagePagePot.kind === "PotSomeUpdating") &&
          O.isSome(messageRequest) &&
          (messageRequest.value === "all" ||
            messageRequest.value === "previous");
        // eslint-disable-next-line no-underscore-dangle
        it(`should return ${expectedOutput}, ${category}, '${
          O.isSome(messageRequest) ? messageRequest.value : "None"
        }' lastRequest, ${messagePagePot.kind}`, () => {
          const state = generateAllPaginatedDataStateForCategory(
            category,
            messagePagePot,
            messageRequest
          );
          const shouldShowRefreshControl =
            shouldShowRefreshControllOnListSelector(state, category);
          expect(shouldShowRefreshControl).toBe(expectedOutput);
        });
      })
    )
  );
});

const generateAllPaginatedDataStateForCategory = (
  category: MessageListCategory,
  data: MessagePagePot,
  lastRequest: LastRequestType = O.none
): GlobalState =>
  ({
    entities: {
      messages: {
        allPaginated: {
          inbox:
            category === "INBOX"
              ? { data, lastRequest }
              : { data: pot.none, lastRequest: O.none },
          archive:
            category === "ARCHIVE"
              ? { data, lastRequest }
              : { data: pot.none, lastRequest: O.none }
        }
      }
    }
  } as GlobalState);

const readonlyNonEmptyMessageList: ReadonlyArray<UIMessage> = [{} as UIMessage];
const nonEmptyMessagePage = {
  page: readonlyNonEmptyMessageList,
  next: "01J06J748BP0MS9FZRPZV8DWCC"
} as MessagePage;

const readonlyEmptyMessageList: ReadonlyArray<UIMessage> = [];
const emptyMessagePage = {
  page: readonlyEmptyMessageList
} as MessagePage;
