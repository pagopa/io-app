import * as pot from "@pagopa/ts-commons/lib/pot";
import * as B from "fp-ts/lib/boolean";
import { constFalse, constUndefined, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { getType } from "typesafe-actions";
import { MessageCategory } from "../../../../../../definitions/communication/MessageCategory.ts";
import { Action } from "../../../../../store/actions/types";
import { paymentsByRptIdSelector } from "../../../../../store/reducers/entities/payments";
import { GlobalState } from "../../../../../store/reducers/types";
import { foldK, isSomeLoadingOrSomeUpdating } from "../../../../../utils/pot";
import { isTextIncludedCaseInsensitive } from "../../../../../utils/strings";
import { clearCache } from "../../../../settings/common/store/actions";
import { UIMessage } from "../../../types";
import {
  MessageListCategory,
  foldK as messageListCategoryFoldK
} from "../../../types/messageListCategory";
import { emptyMessageArray } from "../../../utils";
import { foldMessageCategoryK } from "../../../utils/messageCategory";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  requestAutomaticMessagesRefresh,
  setShownMessageCategoryAction,
  upsertMessageStatusAttributes
} from "../../actions";
import { reduceAutomaticMessageRefreshRequest } from "./automaticMessagesRefresh.ts";
import { reduceLoadNextPage } from "./loadNextPage.ts";
import { reduceLoadPreviousPage } from "./loadPreviousPage.ts";
import { reduceReloadAll } from "./reloadAll.ts";
import type {
  AllPaginated,
  Collection,
  LastRequestValues,
  MessagePage,
  MessagePagePot
} from "./types.ts";
import { reduceUpsertMessageStatusAttributes } from "./upsertMessageStatusAttributes.ts";
const ALL_PAGINATED_INITIAL_STATE: AllPaginated = {
  archive: {
    data: pot.none,
    lastRequest: undefined,
    lastUpdateTime: new Date(0)
  },
  inbox: {
    data: pot.none,
    lastRequest: undefined,
    lastUpdateTime: new Date(0)
  },
  shownCategory: "INBOX"
};

/**
 * A reducer to store all messages with pagination
 */
const reducer = (
  state: AllPaginated = ALL_PAGINATED_INITIAL_STATE,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(setShownMessageCategoryAction):
      return {
        ...state,
        shownCategory: action.payload
      };
    case getType(reloadAllMessages.request):
    case getType(reloadAllMessages.success):
    case getType(reloadAllMessages.failure):
      return reduceReloadAll(state, action);

    case getType(loadNextPageMessages.request):
    case getType(loadNextPageMessages.success):
    case getType(loadNextPageMessages.failure):
      return reduceLoadNextPage(state, action);

    case getType(loadPreviousPageMessages.request):
    case getType(loadPreviousPageMessages.success):
    case getType(loadPreviousPageMessages.failure):
      return reduceLoadPreviousPage(state, action);

    case getType(upsertMessageStatusAttributes.request):
    case getType(upsertMessageStatusAttributes.success):
    case getType(upsertMessageStatusAttributes.failure):
      return reduceUpsertMessageStatusAttributes(state, action);

    case getType(requestAutomaticMessagesRefresh):
      return reduceAutomaticMessageRefreshRequest(state, action);

    case getType(clearCache):
      return {
        ...ALL_PAGINATED_INITIAL_STATE,
        shownCategory: state.shownCategory
      };

    default:
      return state;
  }
};

// Selectors

/**
 * True if the inbox state is loading or updating, regardless of the request
 * that triggered the load/update.
 * @param state
 */
export const isLoadingOrUpdatingInbox = (state: GlobalState) =>
  pipe(
    state.entities.messages.allPaginated.inbox.data,
    inboxPot => pot.isLoading(inboxPot) || pot.isUpdating(inboxPot)
  );

export const shownMessageCategorySelector = (state: GlobalState) =>
  state.entities.messages.allPaginated.shownCategory;

export const messageListForCategorySelector = (
  state: GlobalState,
  category: MessageListCategory
) =>
  pipe(
    state,
    messagePagePotFromCategorySelector(category),
    foldK(
      () => emptyMessageArray,
      constUndefined,
      constUndefined,
      _ => emptyMessageArray,
      messagePage => messagePage.page,
      messagePage => messagePage.page,
      (messagePage, _) => messagePage.page,
      (messagePage, _) => messagePage.page
    )
  );

export const messageCountForCategorySelector = (
  state: GlobalState,
  shownCategory: MessageListCategory
) =>
  pipe(
    state,
    messagePagePotFromCategorySelector(shownCategory),
    foldK(
      () => 0,
      () => 0,
      () => 0,
      () => 0,
      messagePage => messagePage.page.length,
      messagePage => messagePage.page.length,
      (messagePage, _) => messagePage.page.length,
      (messagePage, _) => messagePage.page.length
    )
  );

export const emptyListReasonSelector = (
  state: GlobalState,
  category: MessageListCategory
): "noData" | "error" | "notEmpty" =>
  pipe(
    state,
    messagePagePotFromCategorySelector(category),
    foldK(
      () => "noData",
      () => "notEmpty",
      () => "notEmpty",
      () => "error",
      reasonFromMessagePageContainer,
      reasonFromMessagePageContainer,
      (container, _) => reasonFromMessagePageContainer(container),
      (container, _) => reasonFromMessagePageContainer(container)
    )
  );

export const shouldShowFooterListComponentSelector = (
  state: GlobalState,
  category: MessageListCategory
) => {
  const pagePot = pipe(
    state,
    messageCollectionFromCategory(category),
    messagePagePotByLastRequest(nextLastRequestSet)
  );
  if (pagePot === undefined) {
    return false;
  }
  return isSomeLoadingOrSomeUpdating(pagePot);
};

export const shouldShowRefreshControllOnListSelector = (
  state: GlobalState,
  category: MessageListCategory
) => {
  const pagePot = pipe(
    state,
    messageCollectionFromCategory(category),
    messagePagePotByLastRequest(allAndPreviousLastRequestSet)
  );
  if (pagePot === undefined) {
    return false;
  }
  return isSomeLoadingOrSomeUpdating(pagePot);
};

export const messagePagePotFromCategorySelector =
  (category: MessageListCategory) => (state: GlobalState) =>
    pipe(
      state,
      messageCollectionFromCategory(category),
      messageCollection => messageCollection.data
    );

/**
 * This method checks if there is a local record of a processed payment
 * for the given message category's rptId (ricevuta pagamento telematico).
 *
 * Be aware that such record is persisted on the device and it is not synchronized
 * with server so it is lost upon device change / app folder cleaning / app uninstall.
 *
 * @param state Redux global state
 * @param category The enriched message category, returned by the `GET /messages?enrich_result_data=true` endpoint, that contains the rptId
 * @returns true if there is a matching paid transaction
 */
export const isPaymentMessageWithPaidNoticeSelector = (
  state: GlobalState,
  category: MessageCategory
) =>
  pipe(
    category,
    foldMessageCategoryK(
      constFalse,
      paymentCategory =>
        pipe(
          state,
          paymentsByRptIdSelector,
          paymentRecord => !!paymentRecord[paymentCategory.rptId]
        ),
      constFalse
    )
  );

const messageCollectionFromCategory =
  (category: MessageListCategory) => (state: GlobalState) =>
    pipe(state.entities.messages.allPaginated, allPaginated =>
      pipe(
        category,
        messageListCategoryFoldK(
          () => allPaginated.inbox,
          () => allPaginated.archive
        )
      )
    );

const reasonFromMessagePageContainer = (
  container: MessagePage
): "notEmpty" | "noData" => (container.page.length > 0 ? "notEmpty" : "noData");

export const inboxMessagesErrorReasonSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.allPaginated.inbox.data,
    messagePotToToastReportableErrorOrUndefined
  );

export const archiveMessagesErrorReasonSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.allPaginated.archive.data,
    messagePotToToastReportableErrorOrUndefined
  );

export const paginatedMessageFromIdForCategorySelector = (
  state: GlobalState,
  messageId: string,
  category: MessageListCategory
) =>
  pipe(
    state,
    messagePagePotFromCategorySelector(category),
    pot.toOption,
    O.map(messagePage => messagePage.page),
    O.chain(RA.findFirst(message => message.id === messageId)),
    O.toUndefined
  );

export const searchMessagesUncachedSelector = (
  state: GlobalState,
  searchText: string,
  minQueryLength: number
) =>
  pipe(searchText.trim(), trimmedSearchText =>
    pipe(
      trimmedSearchText.length >= minQueryLength,
      B.fold(
        () => [] as ReadonlyArray<UIMessage>,
        () =>
          pipe(
            state.entities.messages.allPaginated.inbox.data,
            pot.toOption,
            O.map(inboxData => inboxData.page),
            O.getOrElse(() => [] as ReadonlyArray<UIMessage>),
            inboxMessages =>
              pipe(
                state.entities.messages.allPaginated.archive.data,
                pot.toOption,
                O.map(archiveData => archiveData.page),
                O.getOrElseW(() => [] as ReadonlyArray<UIMessage>),
                archiveMessages => inboxMessages.concat(archiveMessages)
              ),
            inboxAndArchiveMessages =>
              inboxAndArchiveMessages.filter(message =>
                isTextIncludedCaseInsensitive(
                  [
                    message.title,
                    message.organizationName,
                    message.serviceName
                  ].join(" "),
                  searchText
                )
              ),
            filteredMessages =>
              [...filteredMessages].sort((a, b) =>
                b.id.localeCompare(a.id, "en")
              )
          )
      )
    )
  );

const messagePotToToastReportableErrorOrUndefined = (
  messagePagePot: MessagePagePot
) =>
  pipe(
    messagePagePot,
    foldK(
      constUndefined,
      constUndefined,
      constUndefined,
      constUndefined,
      constUndefined,
      constUndefined,
      constUndefined,
      (_value, messageError) => messageError.reason
    )
  );

const messagePagePotByLastRequest =
  (lastRequestValues: Set<LastRequestValues>) =>
  (messageCollection: Collection): MessagePagePot | undefined => {
    const { lastRequest } = messageCollection;
    if (lastRequest !== undefined && lastRequestValues.has(lastRequest)) {
      return messageCollection.data;
    }
    return undefined;
  };

const nextLastRequestSet = new Set<LastRequestValues>(["next"]);
const allAndPreviousLastRequestSet = new Set<LastRequestValues>([
  "all",
  "previous"
]);

export default reducer;
