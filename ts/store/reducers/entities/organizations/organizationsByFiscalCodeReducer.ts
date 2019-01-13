/**
 * A reducer to store the organization names by their fiscal codes
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { getType } from "typesafe-actions";

import { loadService } from "../../../actions/services";
import { Action } from "../../../actions/types";

/**
 * Maps organization fiscal code to serviceId
 */
export type OrganizationNamesByFiscalCodeState = Readonly<{
  [key: string]: NonEmptyString | undefined;
}>;

const INITIAL_STATE: OrganizationNamesByFiscalCodeState = {};

export function servicesByOrganizationFiscalCodeReducer(
  state: OrganizationNamesByFiscalCodeState = INITIAL_STATE,
  action: Action
): OrganizationNamesByFiscalCodeState {
  switch (action.type) {
    case getType(loadService.success):
      return {
        ...state,
        [action.payload.organization_fiscal_code]:
          action.payload.organization_name
      };

    default:
      return state;
  }
}
