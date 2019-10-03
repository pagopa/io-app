/**
 * Organizations reducer
 */
import { combineReducers } from "redux";
import { Action } from "../../../actions/types";
import organizationsAllReducer from "./organizationsAll";
import { OrganizationsAllState } from "./organizationsAll";
import { OrganizationNamesByFiscalCodeState } from "./organizationsByFiscalCodeReducer";
import organizationsByFiscalCodeReducer from "./organizationsByFiscalCodeReducer";

// TODO: evaluate if organizations.all should be deleted or remodulated: it was introduced to
// implement the selection of the user areas of interest (services sections) that now get the organizations
// list by filtering the sections of local services.
// https://www.pivotaltracker.com/story/show/168642579

export type OrganizationsState = Readonly<{
  all: OrganizationsAllState;
  nameByFiscalCode: OrganizationNamesByFiscalCodeState;
}>;

const reducer = combineReducers<OrganizationsState, Action>({
  all: organizationsAllReducer,
  nameByFiscalCode: organizationsByFiscalCodeReducer
});

export default reducer;
