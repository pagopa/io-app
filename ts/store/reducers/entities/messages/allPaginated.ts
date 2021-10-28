/**
 * A reducer to store all messages with pagination
 */

import * as pot from "italia-ts-commons/lib/pot";
import { none, Option, some } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

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

/**
 * A list of messages and pagination data.
 */
export type AllPaginated = {
  data: pot.Pot<
    { page: ReadonlyArray<UIMessage>; previous?: Cursor; next?: Cursor },
    string
  >;

  /** persist the last action type occurred */
  lastRequest: Option<"previous" | "next" | "all">;
};

const INITIAL_STATE: AllPaginated = {
  data: pot.none,
  lastRequest: none
};

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
    case getType(reloadAllMessages.request):
      return {
        data: pot.toLoading(state.data),
        lastRequest: some("all")
      };

    case getType(reloadAllMessages.success):
      return {
        data: pot.some({
          page: action.payload.messages,
          previous: action.payload.pagination.previous,
          next: action.payload.pagination.next
        }),
        lastRequest: none
      };

    case getType(reloadAllMessages.failure):
      return {
        ...state,
        data: pot.toError(state.data, action.payload.message)
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
      return { data: pot.toLoading(state.data), lastRequest: some("next") };

    case getType(loadNextPageMessages.success):
      const nextData = pot
        .toOption(state.data)
        .map(previousState =>
          pot.some({
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

      return {
        data: nextData,
        lastRequest: none
      };

    case getType(loadNextPageMessages.failure):
      return {
        ...state,
        data: pot.toError(state.data, action.payload.message)
      };

    default:
      return state;
  }
};

// TODO: handle pull-to-refresh
const reduceLoadPreviousPage = (
  state: AllPaginated = INITIAL_STATE,
  action: Action
): AllPaginated => {
  switch (action.type) {
    case getType(loadNextPageMessages.request):
      // TODO: update the state somehow
      return state;

    case getType(loadNextPageMessages.success):
      // TODO: update the state with the previous page
      return state;

    case getType(loadNextPageMessages.failure):
      // TODO: convey the error while preserving the Pot semantics
      return {
        ...state,
        data: pot.toError(state.data, action.payload.message)
      };

    default:
      return state;
  }
};

// Selectors
export const allPaginatedMessagesSelector = (
  state: GlobalState
): AllPaginated["data"] => state.entities.messages.allPaginated.data;

export const allMessagesSelector = (
  state: GlobalState
): ReadonlyArray<UIMessage> =>
  pot.getOrElse(
    pot.map(state.entities.messages.allPaginated.data, _ => _.page),
    []
  );

export const isLoadingNextPage = (state: GlobalState): boolean => {
  const { data, lastRequest } = state.entities.messages.allPaginated;
  return lastRequest
    .map(_ => _ === "next" && pot.isLoading(data))
    .getOrElse(false);
};

export const isLoadingPreviousPage = (state: GlobalState): boolean => {
  const { data, lastRequest } = state.entities.messages.allPaginated;
  return lastRequest
    .map(_ => _ === "previous" && pot.isLoading(data))
    .getOrElse(false);
};

export default reducer;
