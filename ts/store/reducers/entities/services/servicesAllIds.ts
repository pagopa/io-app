/**
 * A reducer to store all services id
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 */

import { Action } from "../../../../actions/types";
import { SERVICE_LOAD_SUCCESS } from "../../../actions/constants";

// An array of services id
export type ServicesAllIdsState = ReadonlyArray<string>;

export const INITIAL_STATE: ServicesAllIdsState = [];

const reducer = (
  state: ServicesAllIdsState = INITIAL_STATE,
  action: Action
): ServicesAllIdsState => {
  switch (action.type) {
    /**
     * A new service has been loaded from the Backend. Add the ID to the array.
     */
    case SERVICE_LOAD_SUCCESS:
      return [...state, action.payload.service_id];

    default:
      return state;
  }
};

export default reducer;
