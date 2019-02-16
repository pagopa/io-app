/**
 * Messages combined reducer
 */

import * as pot from "io-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";

import { isDefined } from "../../../../utils/guards";
import { Action } from "../../../actions/types";
import messagesAllIdsReducer, {
  messagesAllIdsSelector,
  MessagesAllIdsState
} from "./messagesAllIds";
import messagesByIdReducer, {
  messagesStateByIdSelector,
  MessageStateById
} from "./messagesById";

export type MessagesState = Readonly<{
  byId: MessageStateById;
  allIds: MessagesAllIdsState; // FIXME: is this used?
}>;

const reducer = combineReducers<MessagesState, Action>({
  byId: messagesByIdReducer,
  allIds: messagesAllIdsReducer
});

// Selectors

/**
 * Returns array of messages IDs inversely lexically ordered.
 */
export const lexicallyOrderedMessagesIds = createSelector(
  messagesAllIdsSelector,
  potIds =>
    pot.map(potIds, ids =>
      [...ids].sort((a: string, b: string) => b.localeCompare(a))
    )
);

/**
 * A selector that using the inversely lexically ordered messages IDs
 * returned by lexicallyOrderedMessagesIds returns an array of the
 * mapped/related messages.
 */
export const lexicallyOrderedMessagesStateSelector = createSelector(
  lexicallyOrderedMessagesIds,
  messagesStateByIdSelector,
  (potIds, messageStateById) =>
    pot.map(potIds, ids =>
      ids.map(messageId => messageStateById[messageId]).filter(isDefined)
    )
);

export default reducer;
