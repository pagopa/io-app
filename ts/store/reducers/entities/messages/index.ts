/**
 * Notifications reducer
 */

import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";

import { Action } from "../../../actions/types";
import messagesAllIdsReducer, {
  messagesAllIdsSelector,
  MessagesAllIdsState
} from "./messagesAllIds";
import messagesByIdReducer, {
  messagesByIdSelector,
  MessagesByIdState
} from "./messagesById";
import messagesUIStatesByIdReducer, {
  MessagesUIStatesByIdState
} from "./messagesUIStatesById";

export type MessagesState = Readonly<{
  byId: MessagesByIdState;
  allIds: MessagesAllIdsState;
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
export const orderedMessagesWithIdSelector = createSelector(
  messagesAllIdsSelector,
  messagesByIdSelector,
  (potIds, messageByIdMap) =>
    pot.map(potIds, ids =>
      [...ids]
        .sort((a: string, b: string) => b.localeCompare(a))
        .map(messageId => ({
          messageId,
          message: messageByIdMap[messageId] || pot.none
        }))
    )
);

export default reducer;
