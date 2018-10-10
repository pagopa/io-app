/**
 * A reducer to store all services id
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { getType } from "typesafe-actions";

import { clearCache } from "../../../actions/profile";
import { loadServiceSuccess } from "../../../actions/services";
import { Action } from "../../../actions/types";

// An array of services id
export type ServicesAllIdsState = ReadonlyArray<string>;

const INITIAL_STATE: ServicesAllIdsState = [];

const reducer = (
  state: ServicesAllIdsState = INITIAL_STATE,
  action: Action
): ServicesAllIdsState => {
  switch (action.type) {
    /**
     * A new service has been loaded from the Backend. Add the ID to the array.
     */
    case getType(loadServiceSuccess):
      return [...state, action.payload.service_id];

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;
