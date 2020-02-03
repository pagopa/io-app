/**
 * A reducer to store the organization names by their fiscal codes
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { getType } from "typesafe-actions";

import {
  deleteUselessOrganizations,
  updateOrganizations
} from "../../../actions/organizations";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

/**
 * Maps organization fiscal code to serviceId
 */
export type OrganizationNamesByFiscalCodeState = Readonly<{
  [key: string]: NonEmptyString | undefined;
}>;

const INITIAL_STATE: OrganizationNamesByFiscalCodeState = {};

const reducer = (
  state: OrganizationNamesByFiscalCodeState = INITIAL_STATE,
  action: Action
): OrganizationNamesByFiscalCodeState => {
  switch (action.type) {
    // when this action is performed, all the keys (fiscal code of the organization)
    // that are not present in the payload are removed from the state.
    case getType(deleteUselessOrganizations):
      return Object.keys(state)
        .filter(key => action.payload.indexOf(key) !== -1)
        .reduce<OrganizationNamesByFiscalCodeState>(
          (acc: OrganizationNamesByFiscalCodeState, key) => {
            return {
              ...acc,
              [key]: state[key]
            };
          },
          {}
        );
    case getType(updateOrganizations):
      return {
        ...state,
        [action.payload.organization_fiscal_code]:
          action.payload.organization_name
      };

    default:
      return state;
  }
};

// Selectors
export const organizationNamesByFiscalCodeSelector = (
  state: GlobalState
): OrganizationNamesByFiscalCodeState => {
  return state.entities.organizations.nameByFiscalCode;
};

export default reducer;
