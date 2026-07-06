import * as pot from "@pagopa/ts-commons/lib/pot";
import * as Notifications from "expo-notifications";
import {
  handleMessageNotificationInteraction,
  testable
} from "../pushNotificationHandlers";
import * as MessagesAnalytics from "../../../messages/analytics";
import { updateNotificationsPendingMessage } from "../../store/actions/pendingMessage";
import {
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../messages/store/actions";
import { maximumItemsFromAPI, pageSize } from "../../../../config";
import { Store } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { ArchivingStatus } from "../../../messages/store/reducers/archiving";
import {
  MessagePage,
  MessagePagePot
} from "../../../messages/store/reducers/allPaginated/types";

jest.mock("../../../messages/analytics");

const EXPO_MSG = "EXPO_MSG";
const ANDROID_MSG = "ANDROID_MSG";
const IOS_MSG = "IOS_MSG";
const MSG_ID = "msg-abc-123";
const messagePagePotNone = pot.none as MessagePagePot;
const {
  messageIdFromNotificationRequest,
  getArchiveAndInboxNextAndPreviousPageIndexes,
  handleForegroundMessageReload
} = testable!;

const makeResponse = ({
  messageId = MSG_ID as string | null
} = {}): Notifications.NotificationResponse =>
  ({
    notification: {
      request: {
        identifier: "notificationId",
        content: {
          data: messageId != null ? { message_id: messageId } : {}
        },
        trigger: { type: "push" }
      }
    }
  }) as unknown as Notifications.NotificationResponse;

/**
 * Build a minimal GlobalState slice with only the fields consumed by
 * handleMessageNotificationInteraction.
 */
const makeState = ({
  inboxData = messagePagePotNone,
  archiveData = messagePagePotNone,
  archivingStatus = "disabled" as ArchivingStatus
} = {}): GlobalState =>
  ({
    entities: {
      messages: {
        allPaginated: {
          inbox: { data: inboxData },
          archive: { data: archiveData }
        },
        archiving: { status: archivingStatus }
      }
    }
  }) as unknown as GlobalState;

const makeMockStore = (
  state: GlobalState
): { store: Store; dispatch: jest.Mock } => {
  const dispatch = jest.fn();
  return {
    store: { dispatch, getState: () => state } as unknown as Store,
    dispatch
  };
};

const buildRequest = ({ expo = false, android = false, ios = false }) =>
  ({
    identifier: "test-id",
    content: {
      data: expo ? { message_id: EXPO_MSG } : undefined
    },
    trigger: {
      type: "push",
      ...(android && {
        remoteMessage: {
          data: { message_id: ANDROID_MSG }
        }
      }),
      ...(ios && {
        payload: { message_id: IOS_MSG }
      })
    }
  }) as unknown as Notifications.NotificationRequest;

describe("messageIdFromNotificationRequest", () => {
  describe("extracts message_id from each platform path", () => {
    test.each([
      {
        name: "expo (content.data)",
        request: buildRequest({ expo: true }),
        expected: EXPO_MSG
      },
      {
        name: "Android (trigger.remoteMessage)",
        request: buildRequest({ android: true }),
        expected: ANDROID_MSG
      },
      {
        name: "iOS (trigger.payload)",
        request: buildRequest({ ios: true }),
        expected: IOS_MSG
      }
    ])("$name", ({ request, expected }) => {
      expect(messageIdFromNotificationRequest(request)).toBe(expected);
    });
  });

  describe("respects path priority (earlier path wins)", () => {
    test.each([
      {
        name: "expo over Android + iOS",
        request: buildRequest({ expo: true, android: true, ios: true }),
        expected: EXPO_MSG
      },
      {
        name: "Android over iOS",
        request: buildRequest({ android: true, ios: true }),
        expected: ANDROID_MSG
      }
    ])("$name", ({ request, expected }) => {
      expect(messageIdFromNotificationRequest(request)).toBe(expected);
    });
  });

  describe("returns undefined when no path yields a message_id", () => {
    test.each([{ name: "absent from all paths", request: buildRequest({}) }])(
      "$name",
      ({ request }) => {
        expect(messageIdFromNotificationRequest(request)).toBeUndefined();
      }
    );
  });
});

describe("getArchiveAndInboxNextAndPreviousPageIndexes", () => {
  it("returns pot.none for both inbox and archive when both are pot.none", () => {
    const state = makeState();
    const result = getArchiveAndInboxNextAndPreviousPageIndexes(state);
    expect(pot.isNone(result.inbox)).toBe(true);
    expect(pot.isNone(result.archive)).toBe(true);
  });

  test.each([
    {
      name: "inbox with cursors",
      inboxData: pot.some({
        page: [],
        previous: "inbox-prev",
        next: "inbox-next"
      } as MessagePage),
      archiveData: messagePagePotNone,
      expectedInbox: pot.some({
        previous: "inbox-prev",
        next: "inbox-next"
      }),
      expectedArchive: messagePagePotNone
    },
    {
      name: "archive with cursors",
      inboxData: messagePagePotNone,
      archiveData: pot.some({
        page: [],
        previous: "archive-prev",
        next: "archive-next"
      } as MessagePage),
      expectedInbox: messagePagePotNone,
      expectedArchive: pot.some({
        previous: "archive-prev",
        next: "archive-next"
      })
    },
    {
      name: "inbox without cursors (propagates undefined)",
      inboxData: pot.some({ page: [] } as MessagePage),
      archiveData: messagePagePotNone,
      expectedInbox: pot.some({ previous: undefined, next: undefined }),
      expectedArchive: messagePagePotNone
    }
  ])(
    "correctly maps { previous, next } for: $name",
    ({ inboxData, archiveData, expectedInbox, expectedArchive }) => {
      const state = makeState({ inboxData, archiveData });
      const result = getArchiveAndInboxNextAndPreviousPageIndexes(state);
      expect(result.inbox).toEqual(expectedInbox);
      expect(result.archive).toEqual(expectedArchive);
    }
  );

  it("maps both when inbox and archive are both pot.some", () => {
    const state = makeState({
      // Deliberately omit `next` to test undefined propagation
      inboxData: pot.some({
        page: [],
        previous: "inbox-prev"
      } as MessagePage),
      // Deliberately omit `previous` to test undefined propagation
      archiveData: pot.some({
        page: [],
        next: "archive-next"
      } as MessagePage)
    });
    const result = getArchiveAndInboxNextAndPreviousPageIndexes(state);
    expect(result.inbox).toEqual(
      pot.some({ previous: "inbox-prev", next: undefined })
    );
    expect(result.archive).toEqual(
      pot.some({ previous: undefined, next: "archive-next" })
    );
  });
});

describe("handleForegroundMessageReload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches reloadAllMessages.request when inbox is pot.none", () => {
    const { store, dispatch } = makeMockStore(
      makeState({ inboxData: pot.none })
    );
    handleForegroundMessageReload(store);

    expect(dispatch).toHaveBeenCalledWith(
      reloadAllMessages.request({
        pageSize,
        filter: {},
        fromUserAction: false
      })
    );
  });

  test.each([
    {
      name: "with previous cursor when inbox has data",
      inboxPage: {
        page: [],
        previous: "fg-reload-prev"
      } as MessagePage,
      expectedCursor: "fg-reload-prev" as string | undefined
    },
    {
      name: "with undefined cursor when inbox page has no previous",
      inboxPage: { page: [] } as MessagePage,
      expectedCursor: undefined as string | undefined
    }
  ])(
    "dispatches loadPreviousPageMessages.request $name",
    ({ inboxPage, expectedCursor }) => {
      const { store, dispatch } = makeMockStore(
        makeState({ inboxData: pot.some(inboxPage) })
      );
      handleForegroundMessageReload(store);

      expect(dispatch).toHaveBeenCalledWith(
        loadPreviousPageMessages.request({
          cursor: expectedCursor,
          pageSize: maximumItemsFromAPI,
          filter: {},
          fromUserAction: false
        })
      );
    }
  );

  test.each([
    {
      name: "inbox is loading",
      inboxData: pot.toLoading(messagePagePotNone),
      archiveData: messagePagePotNone,
      archivingStatus: "disabled" as ArchivingStatus
    },
    {
      name: "archive is loading",
      inboxData: messagePagePotNone,
      archiveData: pot.toLoading(messagePagePotNone),
      archivingStatus: "disabled" as ArchivingStatus
    },
    {
      name: "archiving is in processing mode",
      inboxData: messagePagePotNone,
      archiveData: messagePagePotNone,
      archivingStatus: "processing" as ArchivingStatus
    }
  ])(
    "does NOT dispatch when $name",
    ({ inboxData, archiveData, archivingStatus }) => {
      const { store, dispatch } = makeMockStore(
        makeState({ inboxData, archiveData, archivingStatus })
      );
      handleForegroundMessageReload(store);

      expect(dispatch).not.toHaveBeenCalled();
    }
  );
});

describe("handleMessageNotificationInteraction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call analytics or dispatch when no message_id is present", () => {
    const { store, dispatch } = makeMockStore(makeState());
    handleMessageNotificationInteraction(
      makeResponse({ messageId: null }),
      false,
      store,
      false
    );

    expect(
      MessagesAnalytics.trackMessageNotificationTap
    ).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("dispatches updateNotificationsPendingMessage when received in background", () => {
    const { store, dispatch } = makeMockStore(makeState());
    handleMessageNotificationInteraction(makeResponse(), false, store, false);

    expect(dispatch).toHaveBeenCalledWith(
      updateNotificationsPendingMessage({ id: MSG_ID, foreground: false })
    );
  });

  test.each([
    { name: "opted in", isAnalyticsOptedIn: true, expected: true },
    { name: "opted out", isAnalyticsOptedIn: false, expected: false }
  ])(
    "trackMessageNotificationTap receives $expected when user is $name",
    ({ isAnalyticsOptedIn, expected }) => {
      const { store } = makeMockStore(makeState());
      handleMessageNotificationInteraction(
        makeResponse(),
        false,
        store,
        isAnalyticsOptedIn
      );

      expect(
        MessagesAnalytics.trackMessageNotificationTap
      ).toHaveBeenCalledWith(MSG_ID, expected);
    }
  );

  describe("foreground notification (receivedInForeground=true)", () => {
    it("triggers a message reload (delegates to handleForegroundMessageReload)", () => {
      const { store, dispatch } = makeMockStore(
        makeState({ inboxData: pot.none })
      );
      handleMessageNotificationInteraction(makeResponse(), true, store, false);

      // Verifies the integration path calls through; reload logic is tested
      // exhaustively in the handleForegroundMessageReload describe block.
      expect(dispatch).toHaveBeenCalledWith(
        reloadAllMessages.request({
          pageSize,
          filter: {},
          fromUserAction: false
        })
      );
    });

    it("tracks analytics even when the foreground reload is skipped due to loading state", () => {
      const { store } = makeMockStore(
        makeState({
          inboxData: pot.toLoading(messagePagePotNone)
        })
      );
      handleMessageNotificationInteraction(makeResponse(), true, store, true);

      expect(
        MessagesAnalytics.trackMessageNotificationTap
      ).toHaveBeenCalledWith(MSG_ID, true);
    });
  });
});
