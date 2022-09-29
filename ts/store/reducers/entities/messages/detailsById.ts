import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { loadMessageDetails } from "../../../actions/messages";
import { clearCache } from "../../../actions/profile";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { UIMessageDetails } from "./types";

/**
 * A list of messages and pagination data.
 */
export type DetailsById = {
  [id: string]: pot.Pot<UIMessageDetails, string>;
};

const INITIAL_STATE: DetailsById = {};

/**
 * A reducer to store all messages details by ID
 */
const reducer = (
  state: DetailsById = INITIAL_STATE,
  action: Action
): DetailsById => {
  switch (action.type) {
    case getType(loadMessageDetails.request): {
      const { id } = action.payload;
      if (state[id]) {
        return { ...state, [id]: pot.toLoading(state[id]) };
      }
      return { ...state, [action.payload.id]: pot.noneLoading };
    }

    case getType(loadMessageDetails.success):
      return { ...state, [action.payload.id]: pot.some(action.payload) };

    case getType(loadMessageDetails.failure): {
      const { id, error } = action.payload;
      if (state[id]) {
        return {
          ...state,
          [id]: pot.toError(state[id], error.message || "UNKNOWN")
        };
      }
      return {
        ...state,
        [action.payload.id]: pot.noneError(error.message || "UNKNOWN")
      };
    }

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors

/**
 * Return the message's details, if any.
 * @param state
 * @param id
 */
export const getDetailsByMessageId = (
  state: GlobalState,
  id: string
): pot.Pot<UIMessageDetails, string> =>
  state.entities.messages.detailsById[id] || pot.none;

export default reducer;
