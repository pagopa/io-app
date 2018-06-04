/**
 * A reducer to store all messages id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { Action } from "../../../../actions/types";
import { GlobalState } from "../../../../reducers/types";
import { MessagesIdsArray } from "../../../../sagas/messages";
import { MESSAGE_LOAD_SUCCESS } from "../../../actions/constants";

export type MessagesAllIdsState = MessagesIdsArray;

export const INITIAL_STATE: MessagesAllIdsState = [];

const reducer = (
  state: MessagesAllIdsState = INITIAL_STATE,
  action: Action
): MessagesAllIdsState => {
  switch (action.type) {
    /**
     * A new message has been loaded from the Backend. Add the ID to the array.
     */
    case MESSAGE_LOAD_SUCCESS:
      return [...state, action.payload.id];

    default:
      return state;
  }
};

// Selectors
export const messagesAllIdsSelector = (
  state: GlobalState
): MessagesIdsArray => {
  return state.entities.messages.allIds;
};

export default reducer;
