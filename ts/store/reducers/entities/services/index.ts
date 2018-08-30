/**
 * Services reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";
import servicesAllIdsReducer, { ServicesAllIdsState } from "./servicesAllIds";

import servicesByIdReducer, { ServicesByIdState } from "./servicesById";
import {
  serviceIdsByOrganizationFiscalCodeReducer,
  ServiceIdsByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  allIds: ServicesAllIdsState;
  byOrgFiscalCode: ServiceIdsByOrganizationFiscalCodeState;
}>;

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer,
  allIds: servicesAllIdsReducer,
  byOrgFiscalCode: serviceIdsByOrganizationFiscalCodeReducer
});

export default reducer;
