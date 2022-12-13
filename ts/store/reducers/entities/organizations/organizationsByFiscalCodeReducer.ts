/**
 * A reducer to store the organization names by their fiscal codes
 */

import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { getType } from "typesafe-actions";
import { logoutSuccess, sessionExpired } from "../../../actions/authentication";

import { updateOrganizations } from "../../../actions/organizations";
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
    case getType(updateOrganizations):
      return {
        ...state,
        [action.payload.organization_fiscal_code]:
          action.payload.organization_name
      };

    case getType(logoutSuccess):
    case getType(sessionExpired):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors
export const organizationNamesByFiscalCodeSelector = (
  state: GlobalState
): OrganizationNamesByFiscalCodeState =>
  state.entities.organizations.nameByFiscalCode;

export default reducer;
