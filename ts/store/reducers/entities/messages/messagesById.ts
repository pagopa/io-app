/**
 * A reducer to store the messages normalized by id
 * It only manages SUCCESS actions because all UI state properties (like
 * loading/error)
 * are managed by different global reducers.
 */
import { Action } from "../../../../actions/types";
import { MessagesListObject } from "../../../../sagas/messages";
import { MESSAGES_LOAD_SUCCESS } from "../../../actions/constants";

export type MessagesByIdState = MessagesListObject;

export const INITIAL_STATE: MessagesByIdState = {};

const reducer = (
  state: MessagesByIdState = INITIAL_STATE,
  action: Action
): MessagesByIdState => {
  switch (action.type) {
    case MESSAGES_LOAD_SUCCESS:
      return { ...state, ...action.payload.messages };

    default:
      return state;
  }
};

export default reducer;
