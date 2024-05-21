import { pot } from "@pagopa/ts-commons";
import { ActionType } from "typesafe-actions";
import { GlobalState } from "../../../../../store/reducers/types";
import { MessageListCategory } from "../../../types/messageListCategory";
import {
  MessagePage,
  MessagePagePot
} from "../../../store/reducers/allPaginated";
import {
  getInitialReloadAllMessagesActionIfNeeded,
  getMessagesViewPagerInitialPageIndex,
  messageListCategoryToViewPageIndex,
  messageViewPageIndexToListCategory
} from "../homeUtils";
import { pageSize } from "../../../../../config";
import { Action } from "../../../../../store/actions/types";
import { reloadAllMessages } from "../../../store/actions";

const createGlobalState = (
  archiveData: MessagePagePot,
  inboxData: MessagePagePot,
  shownCategory: MessageListCategory
) =>
  ({
    entities: {
      messages: {
        allPaginated: {
          archive: {
            data: archiveData
          },
          inbox: {
            data: inboxData
          },
          shownCategory
        }
      }
    }
  } as GlobalState);

const checkReturnedAction = (action?: Action, getArchived: boolean = false) => {
  expect(action).not.toBeUndefined();
  expect(action?.type).toBe("MESSAGES_RELOAD_REQUEST");
  const reloadAllMessagesRequest = action as ActionType<
    typeof reloadAllMessages.request
  >;
  expect(reloadAllMessagesRequest?.payload.pageSize).toBe(pageSize);
  expect(reloadAllMessagesRequest?.payload.filter.getArchived).toBe(
    getArchived
  );
};

describe("getInitialReloadAllMessagesActionIfNeeded", () => {
  it("should return reloadAllMessages.request when showing inbox with pot.none inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.none,
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    checkReturnedAction(reloadAllMessagesRequest);
  });
  it("should return undefined when showing inbox with pot.noneLoading inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.noneLoading,
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.noneUpdating inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.noneUpdating({} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.noneError inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.noneError(""),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.some inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.some({} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someLoading inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.someLoading({} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someUpdating inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.someUpdating({} as MessagePage, {} as MessagePage),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing inbox with pot.someError inbox", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.someError({} as MessagePage, ""),
      "INBOX"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });

  it("should return reloadAllMessages.request when showing archive with pot.none archive", () => {
    const globalState = createGlobalState(
      pot.none,
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    checkReturnedAction(reloadAllMessagesRequest, true);
  });
  it("should return undefined when showing archive with pot.noneLoading archive", () => {
    const globalState = createGlobalState(
      pot.noneLoading,
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.noneUpdating archive", () => {
    const globalState = createGlobalState(
      pot.noneUpdating({} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.noneError archive", () => {
    const globalState = createGlobalState(
      pot.noneError(""),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.some archive", () => {
    const globalState = createGlobalState(
      pot.some({} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someLoading archive", () => {
    const globalState = createGlobalState(
      pot.someLoading({} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someUpdating archive", () => {
    const globalState = createGlobalState(
      pot.someUpdating({} as MessagePage, {} as MessagePage),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
  it("should return undefined when showing archive with pot.someError archive", () => {
    const globalState = createGlobalState(
      pot.someError({} as MessagePage, ""),
      pot.some({} as MessagePage),
      "ARCHIVE"
    );
    const reloadAllMessagesRequest =
      getInitialReloadAllMessagesActionIfNeeded(globalState);
    expect(reloadAllMessagesRequest).toBeUndefined();
  });
});

describe("getMessagesViewPagerInitialPageIndex", () => {
  it("should return 1 when shownCategory is ARCHIVED", () => {
    const globalState = createGlobalState(pot.none, pot.none, "ARCHIVE");
    const pageIndex = getMessagesViewPagerInitialPageIndex(globalState);
    expect(pageIndex).toBe(1);
  });
  it("should return 0 when shownCategory is INBOX", () => {
    const globalState = createGlobalState(pot.none, pot.none, "INBOX");
    const pageIndex = getMessagesViewPagerInitialPageIndex(globalState);
    expect(pageIndex).toBe(0);
  });
});

describe("messageListCategoryToViewPageIndex", () => {
  it("should return 0 for INBOX", () => {
    const pageIndex = messageListCategoryToViewPageIndex("INBOX");
    expect(pageIndex).toBe(0);
  });
  it("should return 1 for ARCHIVE", () => {
    const pageIndex = messageListCategoryToViewPageIndex("ARCHIVE");
    expect(pageIndex).toBe(1);
  });
});

describe("messageViewPageIndexToListCategory", () => {
  it("should return ARCHIVE when index is 1", () => {
    const listCategory = messageViewPageIndexToListCategory(1);
    expect(listCategory).toBe("ARCHIVE");
  });
  it("should return INBOX when index is 0", () => {
    const listCategory = messageViewPageIndexToListCategory(0);
    expect(listCategory).toBe("INBOX");
  });
  it("should return INBOX when index is -1", () => {
    const listCategory = messageViewPageIndexToListCategory(-1);
    expect(listCategory).toBe("INBOX");
  });
  it("should return INBOX when index is 2", () => {
    const listCategory = messageViewPageIndexToListCategory(2);
    expect(listCategory).toBe("INBOX");
  });
});
