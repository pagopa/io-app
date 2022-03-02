import * as pot from "italia-ts-commons/lib/pot";
import { none, Option, some } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";

import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { UIMessage } from "./types";

export type Cursor = string;

type Collection = pot.Pot<
  { page: ReadonlyArray<UIMessage>; previous?: Cursor; next?: Cursor },
  string
>;

/**
 * A list of messages and pagination data.
 */
export type AllPaginated = {
  data: Collection;

  archive: Collection;

  /** persist the last action type occurred */
  lastRequest: Option<"previous" | "next" | "all">;
};

const INITIAL_STATE: AllPaginated = {
  data: pot.none,
  archive: pot.none,
  lastRequest: none
};

/**
 * A reducer to store all messages with pagination
 */
const reducer = (
  state: AllPaginated = INITIAL_STATE,
  action: Action
): AllPaginated => {
  switch (action.type) {
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

    case getType(clearCache):
      return INITIAL_STATE;

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
      // TODO: send the fucking payload :lol:
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: pot.toLoading(state.archive),
          lastRequest: some("all")
        };
      }
      return {
        ...state,
        data: pot.toLoading(state.data),
        lastRequest: some("all")
      };
    }

    case getType(reloadAllMessages.success): {
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: pot.some({
            page: action.payload.messages,
            previous: action.payload.pagination.previous,
            next: action.payload.pagination.next
          }),
          lastRequest: none
        };
      }
      return {
        ...state,
        data: pot.some({
          page: action.payload.messages,
          previous: action.payload.pagination.previous,
          next: action.payload.pagination.next
        }),
        lastRequest: none
      };
    }

    case getType(reloadAllMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: pot.toError(state.archive, action.payload.error.message)
        };
      }
      return {
        ...state,
        data: pot.toError(state.data, action.payload.error.message)
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
          archive: pot.toLoading(state.data),
          lastRequest: some("next")
        };
      }
      return {
        ...state,
        data: pot.toLoading(state.data),
        lastRequest: some("next")
      };

    case getType(loadNextPageMessages.success):
      // we store the previous item only if the list was empty
      const getNextData = (current: Collection) =>
        pot
          .toOption(current)
          .map(previousState =>
            pot.some({
              ...previousState,
              page: previousState.page.concat(action.payload.messages),
              next: action.payload.pagination.next
            })
          )
          .getOrElse(
            pot.some({
              page: [...action.payload.messages],
              next: action.payload.pagination.next
            })
          );

      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: getNextData(state.archive),
          lastRequest: none
        };
      }

      return { ...state, data: getNextData(state.data), lastRequest: none };

    case getType(loadNextPageMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: pot.toError(state.data, action.payload.error.message)
        };
      }
      return {
        ...state,
        data: pot.toError(state.data, action.payload.error.message)
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
          archive: pot.toLoading(state.archive),
          lastRequest: some("previous")
        };
      }
      return {
        ...state,
        data: pot.toLoading(state.data),
        lastRequest: some("previous")
      };

    case getType(loadPreviousPageMessages.success):
      const getNextData = (current: Collection) =>
        pot
          .toOption(current)
          .map(previousState =>
            pot.some({
              ...previousState,
              page: action.payload.messages.concat(previousState.page),
              // preserve previous if not present or it will be impossible to
              // retrieve further messages
              previous:
                action.payload.pagination.previous ?? previousState.previous
            })
          )
          .getOrElse(
            pot.some({
              page: [...action.payload.messages],
              previous: action.payload.pagination.previous
            })
          );

      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: getNextData(state.archive),
          lastRequest: none
        };
      }

      return {
        ...state,
        data: getNextData(state.data),
        lastRequest: none
      };

    case getType(loadPreviousPageMessages.failure):
      if (action.payload.filter.getArchived) {
        return {
          ...state,
          archive: pot.toError(state.archive, action.payload.error.message)
        };
      }
      return {
        ...state,
        data: pot.toError(state.data, action.payload.error.message)
      };

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
 * Return the data in the Inbox
 * @param state
 */
export const allInboxSelector = (state: GlobalState): AllPaginated["data"] =>
  state.entities.messages.allPaginated.data;

/**
 * Return the data in the Inbox
 * @param state
 */
export const allArchiveSelector = (
  state: GlobalState
): AllPaginated["archive"] => state.entities.messages.allPaginated.archive;

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

export const getById = createSelector(
  [
    allInboxMessagesSelector,
    allArchiveMessagesSelector,
    (_: GlobalState, messageId: string) => messageId
  ],
  (inboxPage, archivePage, messageId): UIMessage | undefined =>
    inboxPage.find(_ => _.id === messageId) ||
    archivePage.find(_ => _.id === messageId)
);

/**
 * True if the state is loading and the last request is for a next page.
 * @param state
 */
export const isLoadingNextPage = createSelector(
  allPaginatedSelector,
  ({ archive, data, lastRequest }) =>
    lastRequest
      .map(_ => _ === "next" && (pot.isLoading(data) || pot.isLoading(archive)))
      .getOrElse(false)
);

/**
 * True if the state is loading and the last request is for a previous page.
 * @param state
 */
export const isLoadingPreviousPage = createSelector(
  allPaginatedSelector,
  ({ archive, data, lastRequest }) =>
    lastRequest
      .map(
        _ => _ === "previous" && (pot.isLoading(data) || pot.isLoading(archive))
      )
      .getOrElse(false)
);

/**
 * True if the state is loading and the last request is for all the messages
 * resulting in a complete reset.
 * @param state
 */
export const isReloading = createSelector(
  allPaginatedSelector,
  ({ archive, data, lastRequest }) =>
    lastRequest
      .map(_ => _ === "all" && (pot.isLoading(data) || pot.isLoading(archive)))
      .getOrElse(false)
);

export const getCursors = createSelector(
  allPaginatedSelector,
  ({ archive, data }) => ({
    archive: pot.map(archive, ({ previous, next }) => ({ previous, next })),
    data: pot.map(data, ({ previous, next }) => ({ previous, next }))
  })
);

export default reducer;
