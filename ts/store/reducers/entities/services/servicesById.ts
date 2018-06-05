/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { GlobalState } from "../../../../reducers/types";
import { SERVICE_LOAD_SUCCESS } from "../../../actions/constants";
import { Action } from "../../../actions/types";

export type ServicesByIdState = Readonly<{
  [key: string]: ServicePublic;
}>;

export const INITIAL_STATE: ServicesByIdState = {};

const reducer = (
  state: ServicesByIdState = INITIAL_STATE,
  action: Action
): ServicesByIdState => {
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
export const servicesByIdSelector = (state: GlobalState): ServicesByIdState => {
  return state.entities.services.byId;
};

export default reducer;
