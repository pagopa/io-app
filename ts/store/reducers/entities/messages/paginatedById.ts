import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import {
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { UIMessage } from "./types";

// State

/**
 * An object containing all the fetched messages keyed by id.
 */
export type PaginatedById = Readonly<{
  [key: string]: pot.Pot<UIMessage, Error>;
}>;

const INITIAL_STATE: PaginatedById = {};

// Reducers

/**
 * A reducer to store all fetched messages indexed by id
 */
export const reducer = (
  state: PaginatedById = INITIAL_STATE,
  action: Action
): PaginatedById => {
  switch (action.type) {
    case getType(reloadAllMessages.success):
    case getType(loadNextPageMessages.success):
    case getType(loadPreviousPageMessages.success):
      return reduceLoadMessages(state, action.payload.messages);
    case getType(upsertMessageStatusAttributes.success):
      return reduceUpsertMessageStatusAttributes(state, action.payload);
    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

const reduceLoadMessages = (
  state: PaginatedById = INITIAL_STATE,
  messages: ReadonlyArray<UIMessage>
): PaginatedById =>
  messages.reduce(
    (acc, message) => ({ ...acc, [message.id]: pot.some(message) }),
    state
  );

const reduceUpsertMessageStatusAttributes = (
  state: PaginatedById = INITIAL_STATE,
  payload: UpsertMessageStatusAttributesPayload
): PaginatedById => {
  const isArchived =
    payload.update.tag === "bulk" || payload.update.tag === "archiving"
      ? payload.update.isArchived
      : payload.message.isArchived;
  const isRead =
    payload.update.tag === "bulk" ||
    payload.update.tag === "reading" ||
    payload.message.isRead;
  return {
    ...state,
    [payload.message.id]: pot.some({ ...payload.message, isArchived, isRead })
  };
};

export default reducer;

// Selectors

const allPaginatedByIdSelector = (state: GlobalState): PaginatedById =>
  state.entities.messages.paginatedById;

export const getMessageById = createSelector(
  [allPaginatedByIdSelector, (_: GlobalState, messageId: string) => messageId],
  (paginatedById, messageId): pot.Pot<UIMessage, Error> =>
    paginatedById[messageId] ?? pot.none
);
