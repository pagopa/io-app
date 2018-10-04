/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { getType } from "typesafe-actions";

import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { loadServiceSuccess } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type ServicesByIdState = Readonly<{
  [key: string]: ServicePublic | undefined;
}>;

type ServiceByIdState = Readonly<ServicePublic>;

const INITIAL_STATE: ServicesByIdState = {};

const reducer = (
  state: ServicesByIdState = INITIAL_STATE,
  action: Action
): ServicesByIdState => {
  switch (action.type) {
    /**
     * A new service has been loaded from the Backend. Add the service to the list object.
     */
    case getType(loadServiceSuccess):
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

export const serviceByIdSelector = (id: string) => (
  state: GlobalState
): ServiceByIdState | undefined => state.entities.services.byId[id];

export default reducer;
