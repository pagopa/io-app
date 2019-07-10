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

export type OrganizationsState = Readonly<{
  all: OrganizationsAllState;
  nameByFiscalCode: OrganizationNamesByFiscalCodeState;
}>;

const reducer = combineReducers<OrganizationsState, Action>({
  all: organizationsAllReducer,
  nameByFiscalCode: organizationsByFiscalCodeReducer
});

/**
 * Returns all organizations lexically ordered.
 */
export const lexicallyOrderedAllOrganizations = createSelector(
  organizationsAllSelector,
  allLexicallyOrdered =>
    [...allLexicallyOrdered].sort((a, b) => (a.name > b.name ? 1 : -1))
);

export default reducer;
