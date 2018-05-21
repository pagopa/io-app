/**
 * Entities reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import messagesReducer, { MessagesState } from "./messages";

export type EntitiesState = {
  messages: MessagesState;
};

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer
});

export default reducer;
