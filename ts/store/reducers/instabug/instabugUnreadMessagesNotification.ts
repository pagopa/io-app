/**
 * Instabug message notification reducer
 */
import { getType } from "typesafe-actions";
import {
  instabugUnreadMessagesNotificationLoaded,
  updateInstabugUnreadNotification
} from "../../actions/instabug";

import { Action } from "../../actions/types";

export type instabugUnreadMessagesNotificationState = Readonly<{
  unreadMessagesNotification: number;
}>;

const INITIAL_STATE: instabugUnreadMessagesNotificationState = {
  unreadMessagesNotification: 0
};

const reducer = (
  state: instabugUnreadMessagesNotificationState = INITIAL_STATE,
  action: Action
): instabugUnreadMessagesNotificationState => {
  switch (action.type) {
    case getType(instabugUnreadMessagesNotificationLoaded):
      return {
        unreadMessagesNotification: action.payload
      };
    case getType(updateInstabugUnreadNotification):
      return {
        unreadMessagesNotification: action.payload.unreadMessagesNotification
      };
  }
  return state;
};

export default reducer;
