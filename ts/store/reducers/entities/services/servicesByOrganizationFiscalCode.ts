/**
 * A reducer to store the serviceIds by organization fiscal codes
 */

import { fromNullable } from "fp-ts/lib/Option";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { getType } from "typesafe-actions";

import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { clearCache } from "../../../actions/profile";
import {
  loadServiceDetail,
  removeServiceTuples
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

/**
 * Maps organization fiscal code to serviceId
 */
export type ServiceIdsByOrganizationFiscalCodeState = Readonly<{
  [key: string]: ReadonlyArray<ServiceId> | undefined;
}>;

const INITIAL_STATE: ServiceIdsByOrganizationFiscalCodeState = {};

// tslint:disable-next-line: cognitive-complexity
export function serviceIdsByOrganizationFiscalCodeReducer(
  state: ServiceIdsByOrganizationFiscalCodeState = INITIAL_STATE,
  action: Action
): ServiceIdsByOrganizationFiscalCodeState {
  switch (action.type) {
    case getType(loadServiceDetail.success):
      const { organization_fiscal_code, service_id } = action.payload;
      // get the current serviceIds for the organization fiscal code
      const servicesForOrganization = state[organization_fiscal_code];

      if (
        servicesForOrganization !== undefined &&
        servicesForOrganization.indexOf(service_id) >= 0
      ) {
        // the service is already in the organization
        return state;
      }

      // add the service to the organization
      const updatedServicesForOrganization =
        servicesForOrganization === undefined
          ? [service_id]
          : [...servicesForOrganization, service_id];

      return {
        ...state,
        [organization_fiscal_code]: updatedServicesForOrganization
      };

    case getType(removeServiceTuples): {
      const serviceTuples: ReadonlyArray<ITuple2<string, string | undefined>> =
        action.payload;

      // Remove service id from the array keyed by organizationFiscalCode
      return serviceTuples.reduce<ServiceIdsByOrganizationFiscalCodeState>(
        (accumulator, tuple) => {
          const serviceId = tuple.e1;
          const organizationFiscalCode = tuple.e2;
          // Extract the services related to the same organization
          const ids = fromNullable(organizationFiscalCode)
            .map(
              _ => (accumulator[_] !== undefined ? accumulator[_] : state[_])
            )
            .toNullable();
          if (organizationFiscalCode && ids) {
            const filteredIds = ids.filter(id => id !== serviceId);
            const result = {
              ...accumulator,
              [organizationFiscalCode]: filteredIds
            };
            if (!filteredIds.length) {
              // tslint:disable-next-line no-object-mutation
              delete result[organizationFiscalCode];
            }
            return result;
          }
          return accumulator;
        },
        state
      );
    }

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
}

// Selectors
export const servicesOrganizationsFiscalCode = (
  state: GlobalState
): ReadonlyArray<string> =>
  Object.keys(state.entities.services.byOrgFiscalCode);
