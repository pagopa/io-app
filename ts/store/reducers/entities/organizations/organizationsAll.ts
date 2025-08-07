/**
 * A reducer to store the organization names and fiscal codes
 */
import { getType } from "typesafe-actions";
import {
  logoutSuccess,
  sessionCorrupted,
  sessionExpired
} from "../../../../features/authentication/common/store/actions";
import { loadServiceDetail } from "../../../../features/services/details/store/actions/details";
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
 * TODO https://www.pivotaltracker.com/story/show/166898141
 */
const reducer = (
  state: OrganizationsAllState = INITIAL_STATE,
  action: Action
): OrganizationsAllState => {
  switch (action.type) {
    case getType(loadServiceDetail.success):
      const organization = state.find(
        _ => _.fiscalCode === action.payload.organization.fiscal_code
      );
      // add only if it is not already present
      if (organization === undefined) {
        return [
          ...state,
          {
            name: action.payload.organization.name,
            fiscalCode: action.payload.organization.fiscal_code
          }
        ];
      }
      return state;
    case getType(logoutSuccess):
    case getType(sessionExpired):
    case getType(sessionCorrupted):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors
export const organizationsAllSelector = (
  state: GlobalState
): OrganizationsAllState => state.entities.organizations.all;

export default reducer;
