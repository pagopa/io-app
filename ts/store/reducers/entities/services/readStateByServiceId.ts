import { getType } from "typesafe-actions";
import { clearCache } from "../../../actions/profile";
import {
  markServiceAsRead,
  showServiceDetails
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type ReadStateByServicesId = Readonly<{
  [key: string]: boolean | undefined;
}>;

const INITIAL_STATE: ReadStateByServicesId = {};

// Selectors
export const readServicesByIdSelector = (
  state: GlobalState
): ReadStateByServicesId => state.entities.services.readState;

// Reducer
export function readServicesByIdReducer(
  state = INITIAL_STATE,
  action: Action
): ReadStateByServicesId {
  switch (action.type) {
    case getType(showServiceDetails):
      // add the service to the read list
      return {
        ...state,
        [action.payload.service_id]: true
      };

    case getType(markServiceAsRead):
      return {
        ...state,
        [action.payload]: true
      };

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default readServicesByIdReducer;
