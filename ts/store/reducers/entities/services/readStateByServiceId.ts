import { getType } from "typesafe-actions";
import {
  markServiceAsRead,
  showServiceDetails
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { differentProfileLoggedIn } from "../../../actions/crossSessions";
import { loadVisibleServicesByScope } from "../../../actions/content";

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
    case getType(loadVisibleServicesByScope.success):
      const { LOCAL, NATIONAL } = action.payload;

      return [...LOCAL, ...NATIONAL].reduce(
        (accumulator: { [key: string]: boolean | undefined }, serviceID) => ({
          ...accumulator,
          [serviceID]: !!state[serviceID]
        }),
        {}
      ) as ReadStateByServicesId;
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
    // reset reading state if current profile is different from the previous one
    case getType(differentProfileLoggedIn):
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default readServicesByIdReducer;
