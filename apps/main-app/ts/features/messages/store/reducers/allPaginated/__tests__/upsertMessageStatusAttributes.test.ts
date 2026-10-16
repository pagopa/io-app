import * as pot from "@pagopa/ts-commons/lib/pot";

import { successReloadMessagesPayload } from "../../../../__mocks__/messages";
import {
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../../actions";
import { AllPaginated } from "../types";
import { reduceUpsertMessageStatusAttributes } from "../upsertMessageStatusAttributes";

const baseState: AllPaginated = {
  inbox: {
    data: pot.none,
    lastRequest: undefined,
    lastUpdateTime: new Date(0)
  },
  archive: {
    data: pot.none,
    lastRequest: undefined,
    lastUpdateTime: new Date(0)
  },
  shownCategory: "INBOX"
};

describe("reduceUpsertMessageStatusAttributes", () => {
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
        ...baseState,
        inbox: { ...baseState.inbox, data: given.inbox },
        archive: { ...baseState.archive, data: given.archive }
      };

      describe(`${when.desc}`, () => {
        const payload: UpsertMessageStatusAttributesPayload = {
          message: when.message,
          update: when.update as UpsertMessageStatusAttributesPayload["update"]
        };

        const requestState = reduceUpsertMessageStatusAttributes(
          initialState,
          upsertMessageStatusAttributes.request(payload)
        );

        it(`${then.desc}`, () => {
          expect(requestState.archive.data).toEqual(then.expectedArchive);
          expect(requestState.inbox.data).toEqual(then.expectedInbox);
        });

        describe(`and the request succeeds`, () => {
          const successState = reduceUpsertMessageStatusAttributes(
            requestState,
            upsertMessageStatusAttributes.success(payload)
          );
          it(`archive and inbox keep their request state`, () => {
            expect(successState.archive.data).toEqual(then.expectedArchive);
            expect(successState.inbox.data).toEqual(then.expectedInbox);
          });
        });

        describe(`and the request fails`, () => {
          const failureState = reduceUpsertMessageStatusAttributes(
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
