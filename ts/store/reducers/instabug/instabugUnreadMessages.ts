/**
 * Instabug message reducer
 */
import { getType } from "typesafe-actions";
import {
  instabugUnreadMessagesLoaded,
  updateInstabugUnreadMessagesLoaded
} from "../../actions/instabug";

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
    case getType(
      instabugUnreadMessagesLoaded || updateInstabugUnreadMessagesLoaded
    ):
      return {
        unreadMessages: action.payload
      };
  }
  return state;
};

export default reducer;

// Selector
export const instabugMessageStateSelector = (state: GlobalState) =>
  state.instabug.unreadMessages;
