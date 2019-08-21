/**
 * Organizations reducer
 */
import { combineReducers } from "redux";
import { Action } from "../../../actions/types";
import organizationsAllReducer from "./organizationsAll";
import { OrganizationsAllState } from "./organizationsAll";
import { OrganizationNamesByFiscalCodeState } from "./organizationsByFiscalCodeReducer";
import organizationsByFiscalCodeReducer from "./organizationsByFiscalCodeReducer";
import organizationsSelectedReducer, {
  OrganizationsSelectedState
} from "./organizationsFiscalCodesSelected";

// TODO: evaluate if organizations.all should be deleted or remodulated: it was introduced to 
// implement the selection of area of interets (service section) that now get the organization 
// list by filtering section of local services.

export type OrganizationsState = Readonly<{
  all: OrganizationsAllState;
  nameByFiscalCode: OrganizationNamesByFiscalCodeState;
  selectedFiscalCodes: OrganizationsSelectedState;
}>;

const reducer = combineReducers<OrganizationsState, Action>({
  all: organizationsAllReducer,
  nameByFiscalCode: organizationsByFiscalCodeReducer,
  selectedFiscalCodes: organizationsSelectedReducer
});

export default reducer;
