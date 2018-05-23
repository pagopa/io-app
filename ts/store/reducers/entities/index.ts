/**
 * Entities reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import messagesReducer, { MessagesState } from "./messages";
import servicesReducer, { ServicesState } from "./services";

export type EntitiesState = {
  messages: MessagesState;
  services: ServicesState;
};

const reducer = combineReducers<EntitiesState, Action>({
  messages: messagesReducer,
  services: servicesReducer
});

export default reducer;
