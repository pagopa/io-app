/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { createSelector } from "reselect";

import { Action } from "../../../../actions/types";
import { messagesComparatorByDateDesc } from "../../../../utils/messages";
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
 */
export const orderedMessagesSelector = createSelector(
  messagesAllIdsSelector,
  messagesByIdSelectors,
  (ids, messages) => {
    return [...ids]
      .sort((id1, id2) =>
        messagesComparatorByDateDesc(messages[id1], messages[id2])
      )
      .map(id => messages[id]);
  }
);

export default reducer;
