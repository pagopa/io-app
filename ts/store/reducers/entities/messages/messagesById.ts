/**
 * A reducer to store the messages normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { MessageWithContentPO } from "../../../../types/MessageWithContentPO";
import { loadMessageSuccess } from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

// An object containing MessageWithContentPO keyed by id
export type MessagesByIdState = Readonly<{
  [key: string]: pot.Pot<MessageWithContentPO, string> | undefined;
}>;

const INITIAL_STATE: MessagesByIdState = {};

const reducer = (
  state: MessagesByIdState = INITIAL_STATE,
  action: Action
): MessagesByIdState => {
  switch (action.type) {
    case getType(loadMessageSuccess):
      // Use the ID as object key
      return { ...state, [action.payload.id]: pot.some(action.payload) };

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors

export const messagesByIdSelector = (state: GlobalState) =>
  state.entities.messages.byId;

export const messageByIdSelector = (id: string) => (state: GlobalState) =>
  state.entities.messages.byId[id];

export default reducer;
