import * as pot from "@pagopa/ts-commons/lib/pot";
import { constFalse, constUndefined, pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import {
  MessageListCategory,
  foldK as messageListCategoryFoldK
} from "../../types/messageListCategory";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  migrateToPaginatedMessages,
  MigrationResult,
  reloadAllMessages,
  resetMigrationStatus,
  setShownMessageCategoryAction,
  upsertMessageStatusAttributes
} from "../actions";
import { clearCache } from "../../../../store/actions/profile";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { UIMessage, UIMessageId } from "../../types";
import { foldK, isSomeLoadingOrSomeUpdating } from "../../../../utils/pot";
import { emptyMessageArray } from "../../utils";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";
import { foldMessageCategoryK } from "../../utils/messageCategory";
import { paymentsByRptIdSelector } from "../../../../store/reducers/entities/payments";

export type MessagePage = {
  page: ReadonlyArray<UIMessage>;
  previous?: string;
  next?: string;
};

export type MessageError = {
  reason: string;
  time: Date;
};

export type MessagePagePot = pot.Pot<MessagePage, MessageError>;

export type LastRequestValues = "previous" | "next" | "all";
export type LastRequestType = O.Option<LastRequestValues>;

type Collection = {
  data: MessagePagePot;
  /** persist the last action type occurred */
  lastRequest: LastRequestType;
};

export type MigrationStatus = O.Option<
  | { _tag: "started"; total: number }
  | { _tag: "succeeded"; total: number }
  | ({ _tag: "failed" } & MigrationResult)
>;

export type MessageOperation = "archive" | "restore";
export type MessageOperationFailure = {
  error: Error;
  operation: MessageOperation;
};

/**
 * A list of messages and pagination inbox.
 */
export type AllPaginated = {
  archive: Collection;
  inbox: Collection;
  latestMessageOperation?: E.Either<MessageOperationFailure, MessageOperation>;
  migration: MigrationStatus;
  shownCategory: MessageListCategory;
};

const INITIAL_STATE: AllPaginated = {
  archive: { data: pot.none, lastRequest: O.none },
  inbox: { data: pot.none, lastRequest: O.none },
  migration: O.none,
  shownCategory: "INBOX"
};

/**
 * A reducer to store all messages with pagination
 */
const reducer = (
  state: AllPaginated = INITIAL_STATE,
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

    /* BEGIN Migration-related block */
    case getType(migrateToPaginatedMessages.request):
      return {
        ...state,
        migration: O.some({
          _tag: "started",
          total: Object.keys(action.payload).length
        })
      };

    case getType(migrateToPaginatedMessages.success):
      return {
        ...state,
        migration: O.some({ _tag: "succeeded", total: action.payload })
      };
    case getType(migrateToPaginatedMessages.failure):
      return {
        ...state,
        migration: O.some({ _tag: "failed", ...action.payload })
      };

    case getType(resetMigrationStatus):
      return {
        ...state,
        migration: O.none
      };
    /* END Migration-related block */

    case getType(clearCache):
      return {
        ...INITIAL_STATE,
        shownCategory: state.shownCategory
      };

    default:
      return state;
  }
};

const reduceReloadAll = (
  state: AllPaginated = INITIAL_STATE,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(reloadAllMessages.request): {
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.toLoading(state.archive.data),
            lastRequest: O.some("all")
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.toLoading(state.inbox.data),
          lastRequest: O.some("all")
        }
      };
    }

    case getType(reloadAllMessages.success): {
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.some({
              page: action.payload.messages,
              previous: action.payload.pagination.previous,
              next: action.payload.pagination.next
            }),
            lastRequest: O.none
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.some({
            page: action.payload.messages,
            previous: action.payload.pagination.previous,
            next: action.payload.pagination.next
          }),
          lastRequest: O.none
        }
      };
    }

    case getType(reloadAllMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.toError(state.archive.data, {
              reason: action.payload.error.message,
              time: new Date()
            }),
            lastRequest: state.archive.lastRequest
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.toError(state.inbox.data, {
            reason: action.payload.error.message,
            time: new Date()
          }),
          lastRequest: state.inbox.lastRequest
        }
      };

    default:
      return state;
  }
};

const reduceLoadNextPage = (
  state: AllPaginated = INITIAL_STATE,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadNextPageMessages.request):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.toLoading(state.archive.data),
            lastRequest: O.some("next")
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.toLoading(state.inbox.data),
          lastRequest: O.some("next")
        }
      };

    case getType(loadNextPageMessages.success):
      // we store the previous item only if the list was empty
      const getNextData = (current: Collection) =>
        pipe(
          pot.toOption(current.data),
          O.map(previousState =>
            pot.some({
              ...previousState,
              page: previousState.page.concat(action.payload.messages),
              next: action.payload.pagination.next
            })
          ),
          O.getOrElse(() =>
            pot.some({
              page: [...action.payload.messages],
              next: action.payload.pagination.next
            })
          )
        );

      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: getNextData(state.archive),
            lastRequest: O.none
          }
        };
      }

      return {
        ...state,
        inbox: {
          data: getNextData(state.inbox),
          lastRequest: O.none
        }
      };

    case getType(loadNextPageMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.toError(state.inbox.data, {
              reason: action.payload.error.message,
              time: new Date()
            }),
            lastRequest: state.archive.lastRequest
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.toError(state.inbox.data, {
            reason: action.payload.error.message,
            time: new Date()
          }),
          lastRequest: state.inbox.lastRequest
        }
      };

    default:
      return state;
  }
};

const reduceLoadPreviousPage = (
  state: AllPaginated = INITIAL_STATE,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadPreviousPageMessages.request):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.toLoading(state.archive.data),
            lastRequest: O.some("previous")
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.toLoading(state.inbox.data),
          lastRequest: O.some("previous")
        }
      };

    case getType(loadPreviousPageMessages.success):
      const getNextData = (current: Collection) =>
        pipe(
          pot.toOption(current.data),
          O.map(previousState =>
            pot.some({
              ...previousState,
              page: action.payload.messages.concat(previousState.page),
              // preserve previous if not present or it will be impossible to
              // retrieve further messages
              previous:
                action.payload.pagination.previous ?? previousState.previous
            })
          ),
          O.getOrElse(() =>
            pot.some({
              page: [...action.payload.messages],
              previous: action.payload.pagination.previous
            })
          )
        );

      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: getNextData(state.archive),
            lastRequest: O.none
          }
        };
      }

      return {
        ...state,
        inbox: {
          data: getNextData(state.inbox),
          lastRequest: O.none
        }
      };

    case getType(loadPreviousPageMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: {
            data: pot.toError(state.archive.data, {
              reason: action.payload.error.message,
              time: new Date()
            }),
            lastRequest: state.archive.lastRequest
          }
        };
      }
      return {
        ...state,
        inbox: {
          data: pot.toError(state.inbox.data, {
            reason: action.payload.error.message,
            time: new Date()
          }),
          lastRequest: state.inbox.lastRequest
        }
      };

    default:
      return state;
  }
};

/**
 * Implements an optimistic UI by updating the state at request time and rolling back the updates
 * in case of failure.
 *
 * @param state
 * @param action
 */
const reduceUpsertMessageStatusAttributes = (
  state: AllPaginated = INITIAL_STATE,
  action: Action
  // eslint-disable-next-line sonarjs/cognitive-complexity
): AllPaginated => {
  const remove = (message: UIMessage, from: Collection) =>
    refreshCursors({
      ...from,
      data: pot.map(from.data, old => ({
        ...old,
        page: old.page.filter(_ => _.id !== message.id)
      }))
    });

  // Messages are inserted locally ONLY if their ID is within the
  // pages that were already fetched. Otherwise, the moved message
  // will be returned by the backend once the user scrolls to that
  // particular page.
  const insert = (message: UIMessage, to: Collection) =>
    refreshCursors({
      ...to,
      data: pot.map(to.data, old => ({
        ...old,
        page:
          old.next === undefined ||
          old.next.localeCompare(message.id, "en") <= 0
            ? [...old.page, message].sort((a, b) =>
                b.id.localeCompare(a.id, "en")
              )
            : old.page
      }))
    });

  // Replaces a message with the same ID in the collection (if found)
  const replace = (message: UIMessage, collection: Collection): Collection => ({
    ...collection,
    data: pot.map(collection.data, old => ({
      ...old,
      page: old.page.map(oldMessage =>
        oldMessage.id === message.id ? message : oldMessage
      )
    }))
  });

  const refreshCursors = (of: Collection): Collection => ({
    ...of,
    data: pot.map(of.data, old => ({
      ...old,
      previous: old.page[0]?.id
      // there's no need to update `next` as:
      // 1. we never insert messages older than `next`
      // 2. removing the last message of the page keeps pagination
      //    working in the backend (i.e. messages older than `next`
      //    are returned even if `next` is not in the inbox/archive
      //    anymore)
    }))
  });

  switch (action.type) {
    case getType(upsertMessageStatusAttributes.request): {
      const message = action.payload.message;
      if (message) {
        const { update } = action.payload;
        const isRead =
          update.tag === "reading" || update.tag === "bulk" || message.isRead;

        if (update.tag === "reading") {
          return {
            ...state,
            archive: replace({ ...message, isRead }, state.archive),
            inbox: replace({ ...message, isRead }, state.inbox)
          };
        }

        if (update.tag === "bulk" || update.tag === "archiving") {
          if (update.isArchived) {
            return {
              ...state,
              archive: insert(
                { ...message, isRead, isArchived: true },
                state.archive
              ),
              inbox: remove(message, state.inbox),
              latestMessageOperation: undefined
            };
          } else {
            return {
              ...state,
              archive: remove(message, state.archive),
              inbox: insert(
                { ...message, isRead, isArchived: false },
                state.inbox
              ),
              latestMessageOperation: undefined
            };
          }
        }
      }
      return { ...state };
    }

    case getType(upsertMessageStatusAttributes.failure): {
      const message = action.payload.payload.message;
      if (message) {
        const { update } = action.payload.payload;

        if (update.tag === "reading") {
          return {
            ...state,
            archive: replace(message, state.archive),
            inbox: replace(message, state.inbox)
          };
        }

        if (update.tag === "bulk" || update.tag === "archiving") {
          if (update.isArchived) {
            return {
              ...state,
              archive: remove(message, state.archive),
              inbox: insert(message, state.inbox),
              latestMessageOperation: E.left({
                operation: "archive",
                error: action.payload.error
              })
            };
          } else {
            return {
              ...state,
              archive: insert(message, state.archive),
              inbox: remove(message, state.inbox),
              latestMessageOperation: E.left({
                operation: "restore",
                error: action.payload.error
              })
            };
          }
        }
      }
      return { ...state };
    }

    case getType(upsertMessageStatusAttributes.success):
      const { update } = action.payload;
      if (update.tag === "bulk" || update.tag === "archiving") {
        return {
          ...state,
          latestMessageOperation: E.right(
            update.isArchived ? "archive" : "restore"
          )
        };
      }
      return state;
    default:
      return state;
  }
};

// Selectors

/**
 * Return the whole state for this reducer.
 * @param state
 */
export const allPaginatedSelector = (state: GlobalState): AllPaginated =>
  state.entities.messages.allPaginated;

/**
 * Return the inbox in the Inbox
 * @param state
 */
export const allInboxSelector = (
  state: GlobalState
): AllPaginated["inbox"]["data"] =>
  state.entities.messages.allPaginated.inbox.data;

/**
 * Return the inbox in the Inbox
 * @param state
 */
export const allArchiveSelector = (
  state: GlobalState
): AllPaginated["archive"]["data"] =>
  state.entities.messages.allPaginated.archive.data;

// We can't use createSelector in this case because
// the category input changes every time based on the route.
// The selector is shared across multiple component instances so
// a possible solution could be to create a selector with a cache
// size greater than one: in this way it is possible to cache more
// than one value.
export const messagesByCategorySelector = (
  state: GlobalState,
  category: MessageListCategory
) => pipe(state, messagePagePotFromCategorySelector(category));

/**
 * Return the list of Inbox messages currently available.
 * @param state
 */
export const allInboxMessagesSelector = createSelector(
  allInboxSelector,
  allPaginated =>
    pot.getOrElse(
      pot.map(allPaginated, _ => _.page),
      []
    )
);

/**
 * Return the list of Archive messages currently available.
 * @param state
 */
export const allArchiveMessagesSelector = createSelector(
  allArchiveSelector,
  // eslint-disable-next-line sonarjs/no-identical-functions
  allPaginated =>
    pot.getOrElse(
      pot.map(allPaginated, _ => _.page),
      []
    )
);

export const allInboxAndArchivedMessagesSelector = createSelector(
  [allInboxMessagesSelector, allArchiveMessagesSelector],
  (inbox, archive) => inbox.concat(archive)
);

/**
 * True if the inbox state is loading and the last request is for a next page.
 * @param state
 */
export const isLoadingInboxNextPage = createSelector(
  allPaginatedSelector,
  ({ inbox }) =>
    pipe(
      inbox.lastRequest,
      O.map(_ => _ === "next" && pot.isLoading(inbox.data)),
      O.getOrElse(constFalse)
    )
);

/**
 * True if the inbox state is loading and the last request is for a previous page.
 * @param state
 */
export const isLoadingInboxPreviousPage = createSelector(
  allPaginatedSelector,
  ({ inbox }) =>
    pipe(
      inbox.lastRequest,
      O.map(_ => _ === "previous" && pot.isLoading(inbox.data)),
      O.getOrElse(constFalse)
    )
);

/**
 * True if the inbox state is loading and the last request is for all the messages
 * resulting in a complete reset.
 * @param state
 */
export const isReloadingInbox = createSelector(
  allPaginatedSelector,
  ({ inbox }) =>
    pipe(
      inbox.lastRequest,
      O.map(_ => _ === "all" && pot.isLoading(inbox.data)),
      O.getOrElse(constFalse)
    )
);

/**
 * True if the inbox state is loading or updating, regardless of the request
 * that triggered the load/update.
 * @param state
 */
export const isLoadingOrUpdatingInbox = createSelector(
  allInboxSelector,
  inboxPot => pot.isLoading(inboxPot) || pot.isUpdating(inboxPot)
);

/**
 * True if the archive state is loading and the last request is for all the messages
 * resulting in a complete reset.
 * @param state
 */
export const isReloadingArchive = createSelector(
  allPaginatedSelector,
  ({ archive }) =>
    pipe(
      archive.lastRequest,
      O.map(_ => _ === "all" && pot.isLoading(archive.data)),
      O.getOrElse(constFalse)
    )
);

/**
 * True if the archive state is loading and the last request is for a next page.
 * @param state
 */
export const isLoadingArchiveNextPage = createSelector(
  allPaginatedSelector,
  ({ archive }) =>
    pipe(
      archive.lastRequest,
      O.map(_ => _ === "next" && pot.isLoading(archive.data)),
      O.getOrElse(constFalse)
    )
);

/**
 * True if the archive state is loading and the last request is for a previous page.
 * @param state
 */
export const isLoadingArchivePreviousPage = createSelector(
  allPaginatedSelector,
  ({ archive }) =>
    pipe(
      archive.lastRequest,
      O.map(_ => _ === "previous" && pot.isLoading(archive.data)),
      O.getOrElse(constFalse)
    )
);

export const getCursors = createSelector(
  allPaginatedSelector,
  ({ archive, inbox }) => ({
    archive: pot.map(archive.data, ({ previous, next }) => ({
      previous,
      next
    })),
    inbox: pot.map(inbox.data, ({ previous, next }) => ({ previous, next }))
  })
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
) =>
  pipe(
    state,
    messageCollectionFromCategory(category),
    messagePagePotByLastRequest(nextLastRequestSet),
    O.map(isSomeLoadingOrSomeUpdating),
    O.getOrElse(constFalse)
  );

export const shouldShowRefreshControllOnListSelector = (
  state: GlobalState,
  category: MessageListCategory
) =>
  pipe(
    state,
    messageCollectionFromCategory(category),
    messagePagePotByLastRequest(allAndPreviousLastRequestSet),
    O.map(isSomeLoadingOrSomeUpdating),
    O.getOrElse(constFalse)
  );

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
  messageId: UIMessageId,
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
  (messageCollection: Collection) =>
    pipe(
      messageCollection.lastRequest,
      O.filter(lastRequest => lastRequestValues.has(lastRequest)),
      O.fold(
        () => O.none,
        () => O.some(messageCollection.data)
      )
    );

const nextLastRequestSet = new Set<LastRequestValues>(["next"]);
const allAndPreviousLastRequestSet = new Set<LastRequestValues>([
  "all",
  "previous"
]);

export default reducer;
