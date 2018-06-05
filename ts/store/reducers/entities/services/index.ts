/**
 * Services reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import servicesAllIdsReducer, { ServicesAllIdsState } from "./servicesAllIds";

import servicesByIdReducer, { ServicesByIdState } from "./servicesById";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  allIds: ServicesAllIdsState;
}>;

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer,
  allIds: servicesAllIdsReducer
});

export default reducer;
