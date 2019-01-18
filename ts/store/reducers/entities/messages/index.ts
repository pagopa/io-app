/**
 * Notifications reducer
 */

import * as pot from "italia-ts-commons/lib/pot";
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
import messagesUIStatesByIdReducer, {
  MessagesUIStatesByIdState
} from "./messagesUIStatesById";

export type MessagesState = Readonly<{
  byId: MessageStateById;
  allIds: MessagesAllIdsState; // FIXME: is this used?
  uiStatesById: MessagesUIStatesByIdState;
}>;

const reducer = combineReducers<MessagesState, Action>({
  byId: messagesByIdReducer,
  allIds: messagesAllIdsReducer,
  uiStatesById: messagesUIStatesByIdReducer
});

// Selectors

/**
 * Returns messages inversely lexically sorted by ID.
 *
 * Note that message IDs are ULIDs (https://github.com/ulid/spec) so this
 * should return messages sorted from most to least recent.
 */
export const orderedMessagesStateSelector = createSelector(
  messagesAllIdsSelector, // FIXME: not needed, we can extract the IDs from messageStateById
  messagesStateByIdSelector,
  (potIds, messageStateById) =>
    pot.map(potIds, ids =>
      [...ids]
        .sort((a: string, b: string) => b.localeCompare(a))
        .map(messageId => messageStateById[messageId])
        .filter(isDefined)
    )
);

export default reducer;
