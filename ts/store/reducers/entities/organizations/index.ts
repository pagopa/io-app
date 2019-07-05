/**
 * Services reducer
 */
import { combineReducers } from "redux";

import { Action } from "../../../actions/types";

import organizationsAllReducer from "./organizationsAll";
import { OrganizationsAllState } from "./organizationsAll";
import { OrganizationNamesByFiscalCodeState } from "./organizationsByFiscalCodeReducer";
import organizationsByFiscalCodeReducer from "./organizationsByFiscalCodeReducer";

export type OrganizationsState = Readonly<{
  all: OrganizationsAllState;
  nameByFiscalCode: OrganizationNamesByFiscalCodeState;
}>;

const reducer = combineReducers<OrganizationsState, Action>({
  all: organizationsAllReducer,
  nameByFiscalCode: organizationsByFiscalCodeReducer
});

export default reducer;
