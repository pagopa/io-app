import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  loadMessageById,
  loadNextPageMessages,
  loadPreviousPageMessages,
  reloadAllMessages,
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
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
    case getType(loadMessageById.request):
    case getType(loadMessageById.success):
    case getType(loadMessageById.failure):
      return reduceLoadMessageById(state, action);
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

const reduceLoadMessageById = (
  state: PaginatedById = INITIAL_STATE,
  action: Action
): PaginatedById => {
  switch (action.type) {
    case getType(loadMessageById.request):
      return {
        ...state,
        [action.payload.id]: pot.toLoading(state[action.payload.id] ?? pot.none)
      };
    case getType(loadMessageById.success):
      return {
        ...state,
        [action.payload.id]: pot.some(action.payload)
      };
    case getType(loadMessageById.failure):
      return {
        ...state,
        [action.payload.id]: pot.toError(
          state[action.payload.id] ?? pot.none,
          action.payload.error
        )
      };
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

export const allPaginatedByIdSelector = (state: GlobalState): PaginatedById =>
  state.entities.messages.paginatedById;

export const getPaginatedMessageById = createSelector(
  [allPaginatedByIdSelector, (_: GlobalState, messageId: string) => messageId],
  (paginatedById, messageId): pot.Pot<UIMessage, Error> =>
    paginatedById[messageId] ?? pot.none
);

export const getServiceByMessageId = createSelector(
  getPaginatedMessageById,
  message => (pot.isSome(message) ? message.value.serviceId : undefined)
);
