import { ActionType } from "typesafe-actions";
import { GlobalState } from "../../../../store/reducers/types";
import { loadNextPageMessages, reloadAllMessages } from "../../store/actions";
import { pageSize } from "../../../../config";
import { MessageListCategory } from "../../types/messageListCategory";
import { UIMessage } from "../../types";
import I18n from "../../../../i18n";
import { convertReceivedDateToAccessible } from "../../utils/convertDateToWordDistance";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { isLoadingServiceByIdSelector } from "../../../services/details/store/reducers/servicesById";
import {
  nextMessagePageStartingIdForCategorySelector,
  nextPageLoadingForCategoryHasErrorSelector
} from "../../store/reducers/allPaginated";

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
    newMessage: I18n.t(
      `messages.accessibility.message.${message.isRead ? "read" : "unread"}`
    ),
    organizationName: message.organizationName,
    serviceName: message.serviceName,
    subject: message.title,
    receivedAt: convertReceivedDateToAccessible(message.createdAt),
    state: ""
  });

export const messageListItemHeight = () => 130;

export const getLoadServiceDetailsActionIfNeeded = (
  state: GlobalState,
  serviceId: ServiceId,
  organizationFiscalCode?: string
): ActionType<typeof loadServiceDetail.request> | undefined => {
  if (!organizationFiscalCode) {
    const isLoading = isLoadingServiceByIdSelector(state, serviceId);
    if (!isLoading) {
      return loadServiceDetail.request(serviceId);
    }
  }
  return undefined;
};

export const getLoadNextPageMessagesActionIfNeeded = (
  state: GlobalState,
  category: MessageListCategory,
  messageListDistanceFromEnd: number
) => {
  const nextMessagePageStartingId =
    nextMessagePageStartingIdForCategorySelector(state, category);
  if (!nextMessagePageStartingId) {
    return undefined;
  }
  const nextPageLoadingHasError = nextPageLoadingForCategoryHasErrorSelector(
    state,
    category
  );
  if (nextPageLoadingHasError && messageListDistanceFromEnd < 1) {
    // This check prevents the page from reloading continuosly when the
    // server endpoint keeps responding with an error. In such case
    // we block the call and let the user scroll a bit up and then down
    // if she wants to try another reload
    return undefined;
  }

  return loadNextPageMessages.request({
    pageSize,
    cursor: nextMessagePageStartingId,
    filter: { getArchived: category === "ARCHIVE" }
  });
};
