import { ActionType } from "typesafe-actions";
import { GlobalState } from "../../../../store/reducers/types";
import { reloadAllMessages } from "../../store/actions";
import { pageSize } from "../../../../config";
import { MessageListCategory } from "../../types/messageListCategory";

export const getInitialReloadAllMessagesActionIfNeeded = (
  state: GlobalState
): ActionType<typeof reloadAllMessages.request> | undefined => {
  const shownMessagesCategory =
    state.entities.messages.allPaginated.shownCategory;
  const areArchivedMessages = shownMessagesCategory === "ARCHIVE";
  const messagesCollection = state.entities.messages.allPaginated;
  const messagesCategoryPot = areArchivedMessages
    ? messagesCollection.archive.data
    : messagesCollection.inbox.data;
  if (messagesCategoryPot.kind === "PotNone") {
    return reloadAllMessages.request({
      pageSize,
      filter: { getArchived: areArchivedMessages }
    });
  }

  return undefined;
};

export const getMessagesViewPagerInitialPageIndex = (state: GlobalState) => {
  const shownMessageCategory =
    state.entities.messages.allPaginated.shownCategory;
  return shownMessageCategory === "ARCHIVE" ? 1 : 0;
};

export const messageListCategoryToViewPageIndex = (
  category: MessageListCategory
) => (category === "ARCHIVE" ? 1 : 0);
export const messageViewPageIndexToListCategory = (
  pageIndex: number
): MessageListCategory => (pageIndex === 1 ? "ARCHIVE" : "INBOX");
