/**
 * A reducer to store the messages normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { CreatedMessageWithoutContent } from "../../../../../definitions/backend/CreatedMessageWithoutContent";
import { MessageWithContentPO } from "../../../../types/MessageWithContentPO";
import { loadMessage, setMessageReadState } from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type MessageUIStates = {
  read: boolean;
};

export type MessageState = {
  meta: CreatedMessageWithoutContent;
  uiStates: MessageUIStates;
  message: pot.Pot<MessageWithContentPO, string | undefined>;
};

// An object containing MessageWithContentPO keyed by id
export type MessageStateById = Readonly<{
  [key: string]: MessageState | undefined;
}>;

const INITIAL_UI_STATES: MessageUIStates = {
  read: false
};

const INITIAL_STATE: MessageStateById = {};

const reducer = (
  state: MessageStateById = INITIAL_STATE,
  action: Action
): MessageStateById => {
  switch (action.type) {
    case getType(loadMessage.request):
      return {
        ...state,
        [action.payload.id]: {
          meta: action.payload,
          message: pot.noneLoading,
          uiStates: INITIAL_UI_STATES
        }
      };

    case getType(loadMessage.success): {
      const id = action.payload.id;
      const prevState = state[id];
      if (prevState === undefined) {
        // we can't deal with a success without a request
        return state;
      }
      return {
        ...state,
        [id]: { ...prevState, message: pot.some(action.payload) }
      };
    }
    case getType(loadMessage.failure): {
      const id = action.payload.id;
      const prevState = state[id];
      if (prevState === undefined) {
        // we can't deal with a failure without a request
        return state;
      }
      return {
        ...state,
        [id]: {
          ...prevState,
          message: pot.noneError(action.payload.error)
        }
      };
    }
    case getType(setMessageReadState): {
      const { id, read } = action.payload;
      const prevState = state[id];
      if (prevState === undefined) {
        // we can't deal with a set read state without a request
        return state;
      }
      const prevUIStates = prevState.uiStates;
      return {
        ...state,
        [id]: {
          ...prevState,
          uiStates: {
            ...prevUIStates,
            read
          }
        }
      };
    }
    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors

export const messagesStateByIdSelector = (state: GlobalState) =>
  state.entities.messages.byId;

export const messageStateByIdSelector = (id: string) => (state: GlobalState) =>
  state.entities.messages.byId[id];

export default reducer;
