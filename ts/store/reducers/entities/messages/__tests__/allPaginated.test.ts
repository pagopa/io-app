import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
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
  reloadAllMessages,
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../../../actions/messages";
import { GlobalState } from "../../../types";
import reducer, {
  isLoadingArchivePreviousPage,
  isLoadingArchiveNextPage,
  isLoadingInboxPreviousPage,
  AllPaginated,
  isLoadingInboxNextPage,
  isLoadingOrUpdatingInbox
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
        it(`preserves the existing lastRequest: ${initialState.inbox.lastRequest}`, () => {
          expect(reducer(initialState, action).inbox.lastRequest).toEqual(
            initialState.inbox.lastRequest
          );
        });
        it("returns the error", () => {
          expect(reducer(initialState, action).inbox.data).toEqual(
            expectedState
          );
        });
      });
    });
});

const defaultState: AllPaginated = {
  inbox: { data: pot.none, lastRequest: O.none },
  archive: { data: pot.none, lastRequest: O.none },
  migration: O.none
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
      inbox: pot.noneError(""),
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
        ""
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
