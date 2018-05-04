import { combineReducers } from "redux";
import { Action } from "../../../actions/types";
import tokenReducer, { TokenState } from "./token";

export type NotificationsState = {
  token: TokenState;
};

const reducer = combineReducers<NotificationsState, Action>({
  token: tokenReducer
});

export default reducer;
