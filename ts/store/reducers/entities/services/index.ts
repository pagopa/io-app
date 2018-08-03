/**
 * Services reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import servicesAllIdsReducer, { ServicesAllIdsState } from "./servicesAllIds";

import servicesByIdReducer, { ServicesByIdState } from "./servicesById";
import {
  servicesByOrganizationFiscalCodeReducer,
  ServicesByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  allIds: ServicesAllIdsState;
  byOrgFiscalCode: ServicesByOrganizationFiscalCodeState;
}>;

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer,
  allIds: servicesAllIdsReducer,
  byOrgFiscalCode: servicesByOrganizationFiscalCodeReducer
});

export default reducer;
