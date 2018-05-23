/**
 * Services reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../../actions/types";
import servicesByIdReducer, { ServicesByIdState } from "./servicesById";

export type ServicesState = {
  byId: ServicesByIdState;
};

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer
});

export default reducer;
