/**
 * A reducer to store all messages with pagination
 */

import * as pot from "italia-ts-commons/lib/pot";
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
export type AllPaginated = pot.Pot<
  { page: ReadonlyArray<UIMessage>; previous?: Cursor; next?: Cursor },
  string
>;

const INITIAL_STATE: AllPaginated = pot.none;

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
      return pot.toLoading(state);

    case getType(reloadAllMessages.success):
      return pot.some({
        page: action.payload.messages,
        previous: action.payload.pagination.previous,
        next: action.payload.pagination.next
      });

    case getType(reloadAllMessages.failure):
      return pot.toError(state, action.payload.message);

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
      return pot.toLoading(state);

    case getType(loadNextPageMessages.success):
      return pot
        .toOption(state)
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

    case getType(loadNextPageMessages.failure):
      return pot.toError(state, action.payload.message);

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
      return pot.toError(state, action.payload.message);

    default:
      return state;
  }
};

// Selectors
export const allPaginatedMessagesSelector = (
  state: GlobalState
): AllPaginated => state.entities.messages.allPaginated;

export default reducer;
