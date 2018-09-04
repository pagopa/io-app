/**
 * A reducer to store the messages normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { MessageWithContentPO } from "../../../../types/MessageWithContentPO";
import { MESSAGE_LOAD_SUCCESS } from "../../../actions/constants";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

// An object containing MessageWithContentPO keyed by id
export type MessagesByIdState = Readonly<{
  [key: string]: MessageWithContentPO | undefined;
}>;

export const INITIAL_STATE: MessagesByIdState = {};

const reducer = (
  state: MessagesByIdState = INITIAL_STATE,
  action: Action
): MessagesByIdState => {
  switch (action.type) {
    /**
     * A new service has been loaded from the Backend. Add the message to the list object.
     */
    case MESSAGE_LOAD_SUCCESS:
      // Use the ID as object key
      return { ...state, [action.payload.id]: { ...action.payload } };

    default:
      return state;
  }
};

// Selectors
export const messagesByIdSelector = (state: GlobalState): MessagesByIdState =>
  state.entities.messages.byId;

export const messageByIdSelector = (id: string) => (
  state: GlobalState
): MessageWithContentPO | undefined => state.entities.messages.byId[id];

export default reducer;
