/**
 * Instabug message reducer
 */
import { getType } from "typesafe-actions";
import { responseInstabugUnreadMessagesLoaded } from "../../actions/instabug";

import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type InstabugUnreadMessagesState = Readonly<{
  unreadMessages: number;
}>;

const INITIAL_STATE: InstabugUnreadMessagesState = {
  unreadMessages: 0
};

const reducer = (
  state: InstabugUnreadMessagesState = INITIAL_STATE,
  action: Action
): InstabugUnreadMessagesState => {
  switch (action.type) {
    case getType(responseInstabugUnreadMessagesLoaded):
      return {
        ...state,
        unreadMessages: action.payload
      };
  }
  return state;
};

export default reducer;

// Selector
export const instabugMessageStateSelector = (state: GlobalState) =>
  state.instabug.message;
