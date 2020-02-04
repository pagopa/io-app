/**
 * Organizations reducer
 */
import { combineReducers } from "redux";
import { Action } from "../../../actions/types";
import { OrganizationNamesByFiscalCodeState } from "./organizationsByFiscalCodeReducer";
import organizationsByFiscalCodeReducer from "./organizationsByFiscalCodeReducer";

export type OrganizationsState = Readonly<{
  nameByFiscalCode: OrganizationNamesByFiscalCodeState;
}>;

const reducer = combineReducers<OrganizationsState, Action>({
  nameByFiscalCode: organizationsByFiscalCodeReducer
});

export default reducer;
