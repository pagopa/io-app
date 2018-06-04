/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { Action } from "../../../../actions/types";
import { GlobalState } from "../../../../reducers/types";
import { ServicesListObject } from "../../../../sagas/messages";
import { SERVICE_LOAD_SUCCESS } from "../../../actions/constants";

export type ServicesByIdState = ServicesListObject;

export const INITIAL_STATE: ServicesListObject = {};

const reducer = (
  state: ServicesByIdState = INITIAL_STATE,
  action: Action
): ServicesListObject => {
  switch (action.type) {
    /**
     * A new service has been loaded from the Backend. Add the service to the list object.
     */
    case SERVICE_LOAD_SUCCESS:
      // Use the ID as object key
      return { ...state, [action.payload.service_id]: { ...action.payload } };
    default:
      return state;
  }
};

// Selectors
export const servicesByIdSelector = (
  state: GlobalState
): ServicesListObject => {
  return state.entities.services.byId;
};

export default reducer;
