/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like
 * loading/error)
 * are managed by different global reducers.
 */

import { Action } from "../../../../actions/types";
import { GlobalState } from "../../../../reducers/types";
import { ServicesListObject } from "../../../../sagas/messages";
import { MESSAGES_LOAD_SUCCESS } from "../../../actions/constants";

export type ServicesByIdState = ServicesListObject;

export const INITIAL_STATE: ServicesListObject = {};

const reducer = (
  state: ServicesByIdState = INITIAL_STATE,
  action: Action
): ServicesListObject => {
  switch (action.type) {
    case MESSAGES_LOAD_SUCCESS:
      return { ...state, ...action.payload.services.byId };
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
