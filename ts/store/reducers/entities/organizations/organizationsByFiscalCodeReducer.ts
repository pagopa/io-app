/**
 * A reducer to store the organization names by their fiscal codes
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { getType } from "typesafe-actions";
import {
  refreshOrganizations,
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

export default function reducer(
  state: OrganizationNamesByFiscalCodeState = INITIAL_STATE,
  action: Action
): OrganizationNamesByFiscalCodeState {
  switch (action.type) {
    // Remove all items whose fiscal code is not present in the payload
    case getType(refreshOrganizations): {
      const updatedOrgsFiscalCode = action.payload;
      const prevState = { ...state };

      return Object.keys(prevState).reduce<OrganizationNamesByFiscalCodeState>(
        (acc: OrganizationNamesByFiscalCodeState, key) => {
          const newAcc = { ...acc };
          if (updatedOrgsFiscalCode.indexOf(key) === -1) {
            // tslint:disable-next-line:no-object-mutation
            delete newAcc[key];
          }
          return newAcc;
        },
        prevState
      );
    }

    // Add a new item or update the organization name
    case getType(updateOrganizations):
      return {
        ...state,
        [action.payload.organization_fiscal_code]:
          action.payload.organization_name
      };

    default:
      return state;
  }
}

// Selectors
export const organizationNamesByFiscalCodeSelector = (
  state: GlobalState
): OrganizationNamesByFiscalCodeState => {
  return state.entities.organizations.nameByFiscalCode;
};
