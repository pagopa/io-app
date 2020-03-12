/**
 * A reducer to store the organization names and fiscal codes
 */
import { getType } from "typesafe-actions";
import { refreshOrganizations } from "../../../actions/organizations";
import { loadServiceDetail } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type Organization = {
  name: string;
  fiscalCode: string;
};

export type OrganizationsAllState = ReadonlyArray<Organization>;

const INITIAL_STATE: OrganizationsAllState = [];

/**
 * This reducer will only return local organizations in the future
 * after the necessary information is returned from the backend
 */
const reducer = (
  state: OrganizationsAllState = INITIAL_STATE,
  action: Action
): OrganizationsAllState => {
  switch (action.type) {
    // Remove all items whose fiscal code is not present in the payload
    case getType(refreshOrganizations): {
      const updatedOrgsFiscalCode = action.payload;
      return state.filter(
        organizations =>
          updatedOrgsFiscalCode.indexOf(organizations.fiscalCode) !== -1
      );
    }

    case getType(loadServiceDetail.success):
      const organization = state.find(
        _ => _.fiscalCode === action.payload.organization_fiscal_code
      );
      // add only if it is not already present
      if (organization === undefined) {
        return [
          ...state,
          {
            name: action.payload.organization_name,
            fiscalCode: action.payload.organization_fiscal_code
          }
        ];
      }
      return state;

    default:
      return state;
  }
};

// Selectors
export const organizationsAllSelector = (
  state: GlobalState
): OrganizationsAllState => {
  return state.entities.organizations.all;
};

export default reducer;
