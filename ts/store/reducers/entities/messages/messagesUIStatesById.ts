/**
 * A reducer to store ui states related to messages
 */

import { getType } from "typesafe-actions";

import {
  loadMessageSuccess,
  setMessageReadState
} from "../../../actions/messages";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type MessageUIStates = {
  read: boolean;
};

// Default states used mainly for old messages already in the store
const DEFAULT_MESSAGE_UI_STATES = {
  read: true
};

export type MessagesUIStatesByIdState = Readonly<{
  [key: string]: MessageUIStates | undefined;
}>;

const INITIAL_STATE: MessagesUIStatesByIdState = {};

const reducer = (
  state: MessagesUIStatesByIdState = INITIAL_STATE,
  action: Action
): MessagesUIStatesByIdState => {
  switch (action.type) {
    case getType(loadMessageSuccess):
      return {
        ...state,
        [action.payload.id]: {
          read: false
        }
      };

    case getType(setMessageReadState):
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          read: action.payload.read
        }
      };

    default:
      return state;
  }
};

export default reducer;

// Utils
export const withDefaultMessageUIStates = (
  messageUIStates?: MessageUIStates
): MessageUIStates => {
  return {
    ...DEFAULT_MESSAGE_UI_STATES,
    ...messageUIStates
  };
};

// Selectors
export const messagesUIStatesByIdSelector = (state: GlobalState) =>
  state.entities.messages.uiStatesById;

export const makeMessageUIStatesByIdSelector = (id: string) => (
  state: GlobalState
): MessageUIStates => {
  return withDefaultMessageUIStates(state.entities.messages.uiStatesById[id]);
};
