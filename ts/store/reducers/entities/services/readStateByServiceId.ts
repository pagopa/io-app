import { getType } from "typesafe-actions";
import { clearCache } from "../../../actions/profile";
import { showServiceDetails } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type ReadStateByServicesId = Readonly<{
  [key: string]: boolean | undefined;
}>;

const INITIAL_STATE: ReadStateByServicesId = {};

export const readStateByServiceIdSelector = (id: string) => (
  state: GlobalState
): boolean | undefined => state.entities.services.readState[id] !== undefined;

export const readServicesSelector = (
  state: GlobalState
): ReadStateByServicesId => state.entities.services.readState;

export function readStateByServiceIdReducer(
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
    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default readStateByServiceIdReducer;
