import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { MessageCategory } from "../../../../../../definitions/communication/MessageCategory.ts";
import { Action } from "../../../../../store/actions/types";
import { paymentsByRptIdSelector } from "../../../../../store/reducers/entities/payments";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isLoadingOrUpdating,
  isSomeLoadingOrSomeUpdating
} from "../../../../../utils/pot";
import { isTextIncludedCaseInsensitive } from "../../../../../utils/strings";
import { clearCache } from "../../../../settings/common/store/actions";
import { MessageListCategory } from "../../../types/messageListCategory";
import { emptyMessageArray } from "../../../utils";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  requestAutomaticMessagesRefresh,
  setShownMessageCategoryAction,
  upsertMessageStatusAttributes
} from "../../actions";
import { reduceAutomaticMessageRefreshRequest } from "./automaticMessagesRefresh.ts";
import { reduceLoadPage } from "./loadPage.ts";
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
    case getType(loadPreviousPageMessages.request):
    case getType(loadPreviousPageMessages.success):
    case getType(loadPreviousPageMessages.failure):
      return reduceLoadPage(state, action);

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
export const isLoadingOrUpdatingInbox = (state: GlobalState) => {
  const inboxPot = state.entities.messages.allPaginated.inbox.data;
  return isLoadingOrUpdating(inboxPot);
};

export const shownMessageCategorySelector = (state: GlobalState) =>
  state.entities.messages.allPaginated.shownCategory;

export const messageListForCategorySelector = (
  state: GlobalState,
  category: MessageListCategory
) => {
  const categoryPot = messagePagePotFromCategorySelector(category, state);
  if (pot.isSome(categoryPot)) {
    return categoryPot.value.page;
  }
  switch (categoryPot.kind) {
    case "PotNone":
    case "PotNoneError":
      return emptyMessageArray;
    default: // noneLoading or noneUpdating
      return undefined;
  }
};

export const messageCountForCategorySelector = (
  state: GlobalState,
  shownCategory: MessageListCategory
) => {
  const categoryPot = messagePagePotFromCategorySelector(shownCategory, state);
  if (pot.isSome(categoryPot)) {
    return categoryPot.value.page.length;
  }
  return 0;
};
export const emptyListReasonSelector = (
  state: GlobalState,
  category: MessageListCategory
): "noData" | "error" | "notEmpty" => {
  const categoryPot = messagePagePotFromCategorySelector(category, state);
  if (pot.isSome(categoryPot)) {
    return reasonFromMessagePageContainer(categoryPot.value);
  }
  switch (categoryPot.kind) {
    case "PotNone":
      return "noData";
    case "PotNoneError":
      return "error";
    default: // noneLoading or noneUpdating
      return "notEmpty";
  }
};

export const shouldShowFooterListComponentSelector = (
  state: GlobalState,
  category: MessageListCategory
) => {
  const categoryPot = messageCollectionFromCategory(category, state);
  const pagePot = messagePagePotByLastRequest(new Set(["next"]), categoryPot);
  if (pagePot === undefined) {
    return false;
  }
  return isSomeLoadingOrSomeUpdating(pagePot);
};

export const shouldShowRefreshControllOnListSelector = (
  state: GlobalState,
  category: MessageListCategory
) => {
  const categoryPot = messageCollectionFromCategory(category, state);
  const pagePot = messagePagePotByLastRequest(
    new Set(["all", "previous"]),
    categoryPot
  );
  if (pagePot === undefined) {
    return false;
  }
  return isSomeLoadingOrSomeUpdating(pagePot);
};

export const messagePagePotFromCategorySelector = (
  category: MessageListCategory,
  state: GlobalState
) => {
  const collection = messageCollectionFromCategory(category, state);
  return collection.data;
};

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
) => {
  if (category.tag !== "PAYMENT") {
    return false;
  }
  const paymentsByRptId = paymentsByRptIdSelector(state);
  return !!paymentsByRptId[category.rptId];
};

const messageCollectionFromCategory = (
  category: MessageListCategory,
  state: GlobalState
) => {
  const allPaginated = state.entities.messages.allPaginated;
  switch (category) {
    case "INBOX":
      return allPaginated.inbox;
    case "ARCHIVE":
      return allPaginated.archive;
  }
};

const reasonFromMessagePageContainer = (container: MessagePage) =>
  container.page.length > 0 ? "notEmpty" : "noData";

export const inboxMessagesErrorReasonSelector = (state: GlobalState) => {
  const inboxPot = state.entities.messages.allPaginated.inbox.data;
  return messagePotToToastReportableErrorOrUndefined(inboxPot);
};

export const archiveMessagesErrorReasonSelector = (state: GlobalState) => {
  const archivePot = state.entities.messages.allPaginated.archive.data;
  return messagePotToToastReportableErrorOrUndefined(archivePot);
};

export const paginatedMessageFromIdForCategorySelector = (
  state: GlobalState,
  messageId: string,
  messageCategory: MessageListCategory
) => {
  const categoryPot = messagePagePotFromCategorySelector(
    messageCategory,
    state
  );
  const undefinedCategory = pot.toUndefined(categoryPot);

  const firstMessage = undefinedCategory?.page.find(
    message => message.id === messageId
  );

  return firstMessage;
};

export const searchMessagesUncachedSelector = (
  state: GlobalState,
  searchText: string,
  minQueryLength: number
) => {
  if (searchText.trim().length < minQueryLength) {
    return emptyMessageArray;
  }
  const {
    inbox: { data: inboxData },
    archive: { data: archiveData }
  } = state.entities.messages.allPaginated;

  const inboxMessages = pot.toUndefined(inboxData)?.page ?? emptyMessageArray;
  const archiveMessages =
    pot.toUndefined(archiveData)?.page ?? emptyMessageArray;

  const filteredMessages = [...inboxMessages, ...archiveMessages].filter(
    message =>
      isTextIncludedCaseInsensitive(
        [message.title, message.organizationName, message.serviceName].join(
          " "
        ),
        searchText
      )
  );
  return [...filteredMessages].sort((a, b) => b.id.localeCompare(a.id, "en"));
};

const messagePotToToastReportableErrorOrUndefined = (
  messagePagePot: MessagePagePot
) => {
  if (messagePagePot.kind === "PotSomeError") {
    return messagePagePot.error.reason;
  }
  return undefined;
};

const messagePagePotByLastRequest = (
  lastRequestValues: Set<LastRequestValues>,
  messageCollection: Collection
): MessagePagePot | undefined => {
  const { lastRequest } = messageCollection;
  if (lastRequest !== undefined && lastRequestValues.has(lastRequest)) {
    return messageCollection.data;
  }
  return undefined;
};

export default reducer;
