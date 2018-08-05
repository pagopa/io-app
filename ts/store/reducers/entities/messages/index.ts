/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { createSelector } from "reselect";

import { isDefined } from "../../../../utils/guards";
import { messagesComparatorByIdDesc } from "../../../../utils/messages";
import { Action } from "../../../actions/types";
import messagesAllIdsReducer, {
  messagesAllIdsSelector,
  MessagesAllIdsState
} from "./messagesAllIds";
import messagesByIdReducer, {
  messagesByIdSelector,
  MessagesByIdState
} from "./messagesById";

export type MessagesState = Readonly<{
  byId: MessagesByIdState;
  allIds: MessagesAllIdsState;
}>;

const reducer = combineReducers<MessagesState, Action>({
  byId: messagesByIdReducer,
  allIds: messagesAllIdsReducer
});

// Selectors

/**
 * A memoized selector that returns messages lexicallu sorted by ID.
 */
export const orderedMessagesSelector = createSelector(
  messagesAllIdsSelector,
  messagesByIdSelector,
  (ids, messageByIdMap) =>
    ids
      .map(id => messageByIdMap[id])
      .filter(isDefined)
      .sort(messagesComparatorByIdDesc)
);

export default reducer;
