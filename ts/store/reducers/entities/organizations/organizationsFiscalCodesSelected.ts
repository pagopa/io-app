/**
 * A reducer to store the organization fiscal codes selected in local tab
 */
import { getType } from "typesafe-actions";
import { setSelectedOrganizations } from "../../../actions/organizations";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type OrganizationsSelectedState = ReadonlyArray<string>;

const INITIAL_STATE: OrganizationsSelectedState = [];

const reducer = (
  state: OrganizationsSelectedState = INITIAL_STATE,
  action: Action
): OrganizationsSelectedState => {
  switch (action.type) {
    case getType(setSelectedOrganizations):
      return action.payload;
    default:
      return state;
  }
};

// Selectors
export const organizationsFiscalCodesSelectedStateSelector = (
  state: GlobalState
): OrganizationsSelectedState => {
  return state.entities.organizations.selectedFiscalCodes;
};

// Get organizations selected by the user that are providing services yet
export const existingOrganizationsFiscalCodesSelectedStateSelector = (
  state: GlobalState
): OrganizationsSelectedState => {
  const set = new Set(state.entities.organizations.selectedFiscalCodes);
  return state.entities.organizations.all
    .filter(org => set.has(org.fiscalCode))
    .map(os => os.fiscalCode);
};

export default reducer;
