import { ActionType } from "typesafe-actions";
import { GlobalState } from "../../../../store/reducers/types";
import { reloadAllMessages } from "../../store/actions";
import { pageSize } from "../../../../config";
import { MessageListCategory } from "../../types/messageListCategory";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { convertReceivedDateToAccessible } from "../../utils/convertDateToWordDistance";

export const getInitialReloadAllMessagesActionIfNeeded = (
  state: GlobalState
): ActionType<typeof reloadAllMessages.request> | undefined => {
  const allPaginatedState = state.entities.messages.allPaginated;
  const shownMessagesCategory = allPaginatedState.shownCategory;
  const isShowingArchivedMessages = shownMessagesCategory === "ARCHIVE";
  const messagesCategoryPot = isShowingArchivedMessages
    ? allPaginatedState.archive.data
    : allPaginatedState.inbox.data;
  if (messagesCategoryPot.kind === "PotNone") {
    return reloadAllMessages.request({
      pageSize,
      filter: { getArchived: isShowingArchivedMessages }
    });
  }

  return undefined;
};

export const getMessagesViewPagerInitialPageIndex = (state: GlobalState) => {
  const shownMessageCategory =
    state.entities.messages.allPaginated.shownCategory;
  return messageListCategoryToViewPageIndex(shownMessageCategory);
};

export const messageListCategoryToViewPageIndex = (
  category: MessageListCategory
) => (category === "ARCHIVE" ? 1 : 0);
export const messageViewPageIndexToListCategory = (
  pageIndex: number
): MessageListCategory => (pageIndex === 1 ? "ARCHIVE" : "INBOX");

export const accessibilityLabelForMessageItem = (message: UIMessage): string =>
  I18n.t("messages.accessibility.message.description", {
    newMessage: message.isRead
      ? I18n.t("messages.accessibility.message.read")
      : I18n.t("messages.accessibility.message.unread"),
    organizationName: message.organizationName,
    serviceName: message.serviceName,
    subject: message.title,
    receivedAt: convertReceivedDateToAccessible(message.createdAt),
    state: ""
  });

export const messageListItemHeight = () => 130;
