/**
 * A reducer to store all messages id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { getType } from "typesafe-actions";

import { loadMessageSuccess } from "../../../actions/messages";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

// An array of messages id
export type MessagesAllIdsState = ReadonlyArray<string>;

const INITIAL_STATE: MessagesAllIdsState = [];

const reducer = (
  state: MessagesAllIdsState = INITIAL_STATE,
  action: Action
): MessagesAllIdsState => {
  switch (action.type) {
    /**
     * A new message has been loaded from the Backend. Add the ID to the array.
     */
    case getType(loadMessageSuccess):
      return [...state, action.payload.id];

    default:
      return state;
  }
};

// Selectors
export const messagesAllIdsSelector = (
  state: GlobalState
): MessagesAllIdsState => {
  return state.entities.messages.allIds;
};

export default reducer;
