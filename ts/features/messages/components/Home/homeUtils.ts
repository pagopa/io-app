import { constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
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
import { isLoadingServiceByIdSelector } from "../../../services/details/store/reducers";
import {
  messagePagePotFromCategorySelector,
  shownMessageCategorySelector
} from "../../store/reducers/allPaginated";
import {
  isLoadingOrUpdating,
  isSomeOrSomeError,
  isStrictNone,
  isStrictSomeError
} from "../../../../utils/pot";

export const getInitialReloadAllMessagesActionIfNeeded = (
  state: GlobalState
): ActionType<typeof reloadAllMessages.request> | undefined =>
  pipe(state, shownMessageCategorySelector, category =>
    pipe(
      state,
      messagePagePotFromCategorySelector(category),
      isStrictNone,
      B.fold(constUndefined, () =>
        initialReloadAllMessagesFromCategory(category)
      )
    )
  );

export const getMessagesViewPagerInitialPageIndex = (state: GlobalState) =>
  pipe(state, shownMessageCategorySelector, messageListCategoryToViewPageIndex);

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

export const getLoadNextPageMessagesActionIfAllowed = (
  state: GlobalState,
  category: MessageListCategory,
  messageListDistanceFromEnd: number
): ActionType<typeof loadNextPageMessages.request> | undefined => {
  const allPaginated = state.entities.messages.allPaginated;

  // No running message loading
  const inboxData = allPaginated.inbox.data;
  const archiveData = allPaginated.archive.data;
  if (isLoadingOrUpdating(inboxData) || isLoadingOrUpdating(archiveData)) {
    return undefined;
  }

  // Check that there are more pages to load
  const { messagePagePot, lastRequest } =
    category === "INBOX"
      ? {
          messagePagePot: inboxData,
          lastRequest: allPaginated.inbox.lastRequest
        }
      : {
          messagePagePot: archiveData,
          lastRequest: allPaginated.archive.lastRequest
        };
  const nextMessagePageStartingId = isSomeOrSomeError(messagePagePot)
    ? messagePagePot.value.next
    : undefined;
  if (!nextMessagePageStartingId) {
    return undefined;
  }

  // If there was an error in the last more-pages-loading, we prevent
  // the page from reloading continuosly when the server endpoint keeps
  // replying with an error. In such case we block the call and let the user
  // scroll a bit up and then down if she wants to try another reload
  if (isStrictSomeError(messagePagePot)) {
    const lastRequestValue = O.isSome(lastRequest)
      ? lastRequest.value
      : undefined;
    if (lastRequestValue === "next" && messageListDistanceFromEnd < 1) {
      return undefined;
    }
  }

  return loadNextPageMessages.request({
    pageSize,
    cursor: nextMessagePageStartingId,
    filter: { getArchived: category === "ARCHIVE" }
  });
};

export const getReloadAllMessagesActionForRefreshIfAllowed = (
  state: GlobalState,
  category: MessageListCategory
): ActionType<typeof reloadAllMessages.request> | undefined => {
  const allPaginated = state.entities.messages.allPaginated;

  // No running message loading
  const archiveMessagePagePot = allPaginated.archive.data;
  const inboxMessagePagePot = allPaginated.inbox.data;
  if (
    isLoadingOrUpdating(archiveMessagePagePot) ||
    isLoadingOrUpdating(inboxMessagePagePot)
  ) {
    return undefined;
  }
  return initialReloadAllMessagesFromCategory(category);
};

const initialReloadAllMessagesFromCategory = (category: MessageListCategory) =>
  reloadAllMessages.request({
    pageSize,
    filter: { getArchived: category === "ARCHIVE" }
  });
