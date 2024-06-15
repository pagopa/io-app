import { constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
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
  messagePagePotFromCategorySelector,
  nextMessagePageStartingIdForCategorySelector,
  nextPageLoadingForCategoryHasErrorSelector,
  shownMessageCategorySelector
} from "../../store/reducers/allPaginated";
import { isSomeOrSomeError, isStrictNone } from "../../../../utils/pot";

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

export const getReloadAllMessagesActionForRefreshIfAllowed = (
  state: GlobalState,
  category: MessageListCategory
): ActionType<typeof reloadAllMessages.request> | undefined =>
  pipe(
    state,
    messagePagePotFromCategorySelector(category),
    isSomeOrSomeError,
    B.fold(constUndefined, () => initialReloadAllMessagesFromCategory(category))
  );

const initialReloadAllMessagesFromCategory = (category: MessageListCategory) =>
  reloadAllMessages.request({
    pageSize,
    filter: { getArchived: category === "ARCHIVE" }
  });
