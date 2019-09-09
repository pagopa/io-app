/**
 * Organizations reducer
 */
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { Action } from "../../../actions/types";
import organizationsAllReducer, {
  organizationsAllSelector
} from "./organizationsAll";
import { OrganizationsAllState } from "./organizationsAll";
import { OrganizationNamesByFiscalCodeState } from "./organizationsByFiscalCodeReducer";
import organizationsByFiscalCodeReducer from "./organizationsByFiscalCodeReducer";
import organizationsSelectedReducer, {
  OrganizationsSelectedState
} from "./organizationsFiscalCodesSelected";

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

/**
 * Returns all organizations lexically ordered.
 */
export const lexicallyOrderedAllOrganizations = createSelector(
  organizationsAllSelector,
  allLexicallyOrdered =>
    [...allLexicallyOrdered].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
);

export default reducer;
