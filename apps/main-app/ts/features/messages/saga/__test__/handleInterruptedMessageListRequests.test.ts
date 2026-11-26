import * as pot from "@pagopa/ts-commons/lib/pot";
import { expectSaga } from "redux-saga-test-plan";
import { put, select } from "redux-saga/effects";

import { pageSize } from "../../../../config";
import { Action } from "../../../../store/actions/types";
import { fastLoginPendingActionsSelector } from "../../../authentication/fastLogin/store/selectors";
import { loadNextPageMessages, reloadAllMessages } from "../../store/actions";
import { allPaginatedSelector } from "../../store/reducers/allPaginated";
import {
  Collection,
  LastRequestValues,
  MessagePagePot
} from "../../store/reducers/allPaginated/types";
import { handleInterruptedMessageListRequests } from "../handleInterruptedMessageListRequests";

const collection = (
  data: MessagePagePot,
  lastRequest?: LastRequestValues
): Collection => ({ data, lastRequest, lastUpdateTime: new Date(0) });

const messagePage = { page: [], next: "next-id", previous: "previous-id" };
const idleCollection = collection(pot.none);

const inboxFilter = { getArchived: false };
const archiveFilter = { getArchived: true };

const inboxReload = reloadAllMessages.request({
  pageSize,
  filter: inboxFilter,
  fromUserAction: false
});
const archiveReload = reloadAllMessages.request({
  pageSize,
  filter: archiveFilter,
  fromUserAction: false
});

type TestCase = {
  archive: Collection;
  expectedActions: ReadonlyArray<Action>;
  inbox: Collection;
  name: string;
  pendingActions: ReadonlyArray<Action>;
};

const testCases: ReadonlyArray<TestCase> = [
  {
    name: "nothing is loading",
    inbox: idleCollection,
    archive: collection(pot.some(messagePage)),
    pendingActions: [],
    expectedActions: []
  },
  {
    name: "the inbox reload was interrupted",
    inbox: collection(pot.noneLoading, "all"),
    archive: idleCollection,
    pendingActions: [],
    expectedActions: [inboxReload]
  },
  {
    name: "the archive reload was interrupted",
    inbox: idleCollection,
    archive: collection(pot.noneLoading, "all"),
    pendingActions: [],
    expectedActions: [archiveReload]
  },
  {
    name: "the reload of a populated inbox was interrupted",
    inbox: collection(pot.someLoading(messagePage), "all"),
    archive: idleCollection,
    pendingActions: [],
    expectedActions: [inboxReload]
  },
  {
    name: "the inbox next page load was interrupted",
    inbox: collection(pot.someLoading(messagePage), "next"),
    archive: idleCollection,
    pendingActions: [],
    expectedActions: []
  },
  {
    name: "the inbox previous page load was interrupted",
    inbox: collection(pot.someLoading(messagePage), "previous"),
    archive: idleCollection,
    pendingActions: [],
    expectedActions: []
  },
  {
    name: "the interrupted inbox request is already pending for fast-login",
    inbox: collection(pot.noneLoading, "all"),
    archive: idleCollection,
    pendingActions: [
      reloadAllMessages.request({
        pageSize,
        filter: {},
        fromUserAction: false
      })
    ],
    expectedActions: []
  },
  {
    name: "the fast-login pending request is not a reload",
    inbox: collection(pot.noneLoading, "all"),
    archive: idleCollection,
    pendingActions: [
      loadNextPageMessages.request({
        pageSize,
        cursor: messagePage.next,
        filter: inboxFilter,
        fromUserAction: true
      })
    ],
    expectedActions: [inboxReload]
  },
  {
    name: "the fast-login pending request belongs to the other category",
    inbox: collection(pot.noneLoading, "all"),
    archive: idleCollection,
    pendingActions: [archiveReload],
    expectedActions: [inboxReload]
  }
];

describe("handleInterruptedMessageListRequests", () => {
  test.each(testCases)(
    "should dispatch the expected requests when $name",
    async ({ archive, expectedActions, inbox, pendingActions }) => {
      const { effects } = await expectSaga(handleInterruptedMessageListRequests)
        .provide([
          [select(fastLoginPendingActionsSelector), pendingActions],
          [
            select(allPaginatedSelector),
            { inbox, archive, shownCategory: "INBOX" }
          ]
        ])
        .run();
      expect(effects.put ?? []).toEqual(
        expectedActions.map(action => put(action))
      );
    }
  );
});
