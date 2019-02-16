/**
 * A reducer to store all messages id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import * as pot from "io-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { loadMessages } from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

// An array of messages id
export type MessagesAllIdsState = pot.Pot<ReadonlyArray<string>, string>;

const INITIAL_STATE: MessagesAllIdsState = pot.none;

const reducer = (
  state: MessagesAllIdsState = INITIAL_STATE,
  action: Action
): MessagesAllIdsState => {
  switch (action.type) {
    case getType(loadMessages.request):
      return pot.toLoading(state);

    case getType(loadMessages.success):
      return pot.some(action.payload);

    case getType(loadMessages.failure):
      return pot.toError(state, action.payload);

    case getType(clearCache):
      return INITIAL_STATE;

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
