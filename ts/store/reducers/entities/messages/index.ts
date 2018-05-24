/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { createSelector } from "reselect";

import { Action } from "../../../../actions/types";
import messagesAllIdsReducer, {
  messagesAllIdsSelector,
  MessagesAllIdsState
} from "./messagesAllIds";
import messagesByIdReducer, {
  messagesByIdSelectors,
  MessagesByIdState
} from "./messagesById";

export type MessagesState = {
  byId: MessagesByIdState;
  allIds: MessagesAllIdsState;
};

const reducer = combineReducers<MessagesState, Action>({
  byId: messagesByIdReducer,
  allIds: messagesAllIdsReducer
});

// Selectors
/**
 * A memoized selector that returns an ordered list of messages.
 * TODO: Add sorting by date as soon as Backend response contains `created_at`
 */
export const orderedMessagesSelector = createSelector(
  messagesAllIdsSelector,
  messagesByIdSelectors,
  (ids, messages) => [...ids].sort().map(id => messages[id])
);

export default reducer;
