import { getType } from "typesafe-actions";
import _ from "lodash";
import {
  loadServiceDetailNotFound,
  markServiceAsRead,
  showServiceDetails
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { differentProfileLoggedIn } from "../../../actions/crossSessions";

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
    case getType(loadServiceDetailNotFound):
      return _.omit(state, [action.payload]);
    // reset reading state if current profile is different from the previous one
    case getType(differentProfileLoggedIn):
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default readServicesByIdReducer;
