/**
 * Notifications reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../../actions/types";
import messagesAllIdsReducer, { MessagesAllIdsState } from "./messagesAllIds";
import messagesByIdReducer, { MessagesByIdState } from "./messagesById";

export type MessagesState = {
  byId: MessagesByIdState;
  allIds: MessagesAllIdsState;
};

const reducer = combineReducers<MessagesState, Action>({
  byId: messagesByIdReducer,
  allIds: messagesAllIdsReducer
});

export default reducer;
