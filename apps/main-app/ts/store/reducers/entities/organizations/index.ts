/**
 * Organizations reducer
 */
import { combineReducers } from "redux";
import { Action } from "../../../actions/types";
import organizationsAllReducer, {
  OrganizationsAllState
} from "./organizationsAll";
import organizationsByFiscalCodeReducer, {
  OrganizationNamesByFiscalCodeState
} from "./organizationsByFiscalCodeReducer";

// TODO: evaluate if organizations.all should be deleted or remodulated: it was introduced to
// implement the selection of the user areas of interest (services sections) that now get the organizations
// list by filtering the sections of local services.

export type OrganizationsState = Readonly<{
  all: OrganizationsAllState;
  nameByFiscalCode: OrganizationNamesByFiscalCodeState;
}>;

const reducer = combineReducers<OrganizationsState, Action>({
  all: organizationsAllReducer,
  nameByFiscalCode: organizationsByFiscalCodeReducer
});

export default reducer;
