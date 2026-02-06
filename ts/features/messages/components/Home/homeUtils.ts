import { constTrue, constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { StyleSheet } from "react-native";
import { ActionType } from "typesafe-actions";
import I18n from "i18next";
import { GlobalState } from "../../../../store/reducers/types";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../store/actions";
import { maximumItemsFromAPI, pageSize } from "../../../../config";
import { MessageListCategory } from "../../types/messageListCategory";
import { UIMessage } from "../../types";
import { convertReceivedDateToAccessible } from "../../utils/convertDateToWordDistance";
import {
  isPaymentMessageWithPaidNoticeSelector,
  messagePagePotFromCategorySelector,
  shownMessageCategorySelector
} from "../../store/reducers/allPaginated";
import {
  isLoadingOrUpdating,
  isSomeOrSomeError,
  isStrictNone,
  isStrictSomeError
} from "../../../../utils/pot";
import { isArchivingInProcessingModeSelector } from "../../store/reducers/archiving";
import NavigationService from "../../../../navigation/NavigationService";
import { trackMessageListEndReached, trackMessagesPage } from "../../analytics";
import { MESSAGES_ROUTES } from "../../navigation/routes";
import { areMessageSagasRegisteredSelector } from "../../store/reducers/messageSectionStatus";
import { TagEnum } from "../../../../../definitions/backend/communication/MessageCategoryPN";
import {
  ListItemMessageEnhancedHeight,
  ListItemMessageStandardHeight
} from "./DS/ListItemMessage";
import { SkeletonHeight } from "./DS/ListItemMessageSkeleton";

export type LayoutInfo = {
  index: number;
  length: number;
  offset: number;
};

export const minDelayBetweenNavigationMilliseconds = 750;
export const nextPageLoadingWaitMillisecondsGenerator = () => 2000;
export const refreshIntervalMillisecondsGenerator = () => 60000;

export const getInitialReloadAllMessagesActionIfNeeded = (
  state: GlobalState
): ActionType<typeof reloadAllMessages.request> | undefined =>
  pipe(state, shownMessageCategorySelector, category =>
    pipe(
      state,
      isDoingAnAsyncOperationOnMessages,
      B.fold(
        () =>
          pipe(
            state,
            messagePagePotFromCategorySelector(category),
            isStrictNone,
            B.fold(constUndefined, () =>
              initialReloadAllMessagesFromCategory(category, false)
            )
          ),
        constUndefined
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

export const accessibilityLabelForMessageItem = (
  message: UIMessage,
  source: MessageListCategory | "SEARCH",
  isSelected?: boolean
): string =>
  I18n.t("messages.accessibility.message.description", {
    newMessage: I18n.t(
      `messages.accessibility.message.${message.isRead ? "read" : "unread"}`
    ),
    selected: isSelected
      ? I18n.t("messages.accessibility.message.selected")
      : "",
    organizationName: message.organizationName,
    serviceName: message.serviceName,
    subject: message.title,
    receivedAt: convertReceivedDateToAccessible(message.createdAt),
    instructions: archiveUnarchiveAccessibilityInstructions(source, isSelected)
  });

export const archiveUnarchiveAccessibilityInstructions = (
  source: MessageListCategory | "SEARCH",
  isSelected?: boolean
): string => {
  // Search screen does not allow archiving/unarchiving
  if (source === "SEARCH") {
    return "";
  }

  // When selected, a message can only be deselected,
  // it does not matter if it is archived or not
  if (isSelected) {
    return I18n.t("messages.accessibility.message.deselectInstructions");
  }

  // When selecting a message, we must specify what the
  // final operation will be (to archive or to unarchive)
  const sourceInstructions =
    source === "ARCHIVE"
      ? I18n.t("messages.accessibility.message.unarchive")
      : I18n.t("messages.accessibility.message.archive");
  return `${I18n.t(
    "messages.accessibility.message.selectInstructions"
  )} ${sourceInstructions}`;
};

export const getLoadNextPageMessagesActionIfAllowed = (
  state: GlobalState,
  category: MessageListCategory,
  comparisonTimeInCaseOfError: Date
): ActionType<typeof loadNextPageMessages.request> | undefined => {
  // No archiving/restoring running
  if (isDoingAnAsyncOperationOnMessages(state)) {
    return undefined;
  }

  const allPaginated = state.entities.messages.allPaginated;

  // Check that there are more pages to load
  const messagePagePot =
    category === "INBOX" ? allPaginated.inbox.data : allPaginated.archive.data;
  const lastRequest =
    category === "INBOX"
      ? allPaginated.inbox.lastRequest
      : allPaginated.archive.lastRequest;
  const nextMessagePageStartingId = isSomeOrSomeError(messagePagePot)
    ? messagePagePot.value.next
    : undefined;
  if (!nextMessagePageStartingId) {
    return undefined;
  }

  // If there was an error in the last more-pages-loading, we prevent
  // the page from reloading continuosly when the server endpoint keeps
  // replying with an error. In such case we block the call and wait for
  // a little bit before the request can be sent again
  if (isStrictSomeError(messagePagePot)) {
    // Make sure not to block the request if the error happened on
    // another one (like the pull to refresh)
    const lastRequestValue = O.isSome(lastRequest)
      ? lastRequest.value
      : undefined;
    if (lastRequestValue === "next") {
      const millisecondsAfterLastError =
        comparisonTimeInCaseOfError.getTime() -
        messagePagePot.error.time.getTime();
      if (
        millisecondsAfterLastError < nextPageLoadingWaitMillisecondsGenerator()
      ) {
        return undefined;
      }
    }
  }

  return loadNextPageMessages.request({
    pageSize,
    cursor: nextMessagePageStartingId,
    filter: { getArchived: category === "ARCHIVE" },
    fromUserAction: true
  });
};

export const getReloadAllMessagesActionForRefreshIfAllowed = (
  state: GlobalState,
  category: MessageListCategory
): ActionType<typeof reloadAllMessages.request> | undefined =>
  pipe(
    state,
    isDoingAnAsyncOperationOnMessages,
    B.fold(
      () => initialReloadAllMessagesFromCategory(category, true),
      constUndefined
    )
  );

const shouldBlockPreviousPageMessagesLoading = (state: GlobalState) =>
  isDoingAnAsyncOperationOnMessages(state) ||
  !areMessageSagasRegisteredSelector(state);

export const getLoadPreviousPageMessagesActionIfAllowed = (
  state: GlobalState
) =>
  pipe(state.entities.messages.allPaginated, allPaginated =>
    pipe(
      allPaginated.shownCategory === "ARCHIVE"
        ? allPaginated.archive
        : allPaginated.inbox,
      shownMessageCollection =>
        pipe(
          shownMessageCollection.lastUpdateTime.getTime() +
            refreshIntervalMillisecondsGenerator() <
            new Date().getTime(),
          B.fold(constUndefined, () =>
            pipe(
              shownMessageCollection.data,
              pot.toOption,
              O.chainNullableK(a => a.previous),
              O.fold(constUndefined, previousPageMessageId =>
                pipe(
                  state,
                  shouldBlockPreviousPageMessagesLoading,
                  B.fold(
                    () =>
                      loadPreviousPageMessages.request({
                        pageSize: maximumItemsFromAPI,
                        cursor: previousPageMessageId,
                        filter: {
                          getArchived: allPaginated.shownCategory === "ARCHIVE"
                        },
                        fromUserAction: false
                      }),
                    constUndefined
                  )
                )
              )
            )
          )
        )
    )
  );

const initialReloadAllMessagesFromCategory = (
  category: MessageListCategory,
  fromUserAction: boolean
) =>
  reloadAllMessages.request({
    pageSize,
    filter: { getArchived: category === "ARCHIVE" },
    fromUserAction
  });

const isDoingAnAsyncOperationOnMessages = (state: GlobalState) =>
  pipe(
    state,
    isArchivingInProcessingModeSelector, // No archiving/restoring running
    B.fold(
      () =>
        pipe(
          // No running message loading
          state.entities.messages.allPaginated,
          allPaginated =>
            isLoadingOrUpdating(allPaginated.archive.data) ||
            isLoadingOrUpdating(allPaginated.inbox.data)
        ),
      constTrue
    )
  );

export const generateMessageListLayoutInfo = (
  loadingList: ReadonlyArray<number>,
  messageList: ReadonlyArray<UIMessage> | undefined,
  state: GlobalState
) => {
  if (messageList) {
    const messageListLayoutInfo: Array<LayoutInfo> = [];
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < messageList.length; i++) {
      const message = messageList[i];
      const messageHasBadge =
        message.category.tag === TagEnum.PN ||
        isPaymentMessageWithPaidNoticeSelector(state, message.category);
      const itemLayoutInfo: LayoutInfo = {
        index: i,
        length: messageHasBadge
          ? ListItemMessageEnhancedHeight
          : ListItemMessageStandardHeight,
        offset:
          i > 0
            ? messageListLayoutInfo[i - 1].offset +
              messageListLayoutInfo[i - 1].length +
              StyleSheet.hairlineWidth
            : 0
      };
      // eslint-disable-next-line functional/immutable-data
      messageListLayoutInfo.push(itemLayoutInfo);
    }
    return messageListLayoutInfo;
  } else {
    return loadingList.map((_, index) => ({
      index,
      length: SkeletonHeight,
      offset: index * SkeletonHeight
    }));
  }
};

export const trackMessagePageOnFocusEventIfAllowed = (state: GlobalState) => {
  const routeName = NavigationService.getCurrentRouteName();
  if (routeName !== MESSAGES_ROUTES.MESSAGES_HOME) {
    return;
  }

  const shownMessageCategory = shownMessageCategorySelector(state);
  const messagePagePot =
    messagePagePotFromCategorySelector(shownMessageCategory)(state);
  if (isSomeOrSomeError(messagePagePot)) {
    // Track message category change
    const selectedShownCategory = shownMessageCategorySelector(state);
    const messageCount = messagePagePot.value.page.length;
    trackMessagesPage(selectedShownCategory, messageCount, pageSize, true);
  }
};

export const trackMessageListEndReachedIfAllowed = (
  category: MessageListCategory,
  willLoadNextPageMessages: boolean,
  state: GlobalState
) => {
  const messagePagePot = messagePagePotFromCategorySelector(category)(state);
  if (isSomeOrSomeError(messagePagePot)) {
    trackMessageListEndReached(category, willLoadNextPageMessages);
  }
};
