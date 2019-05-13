/**
 * A reducer to store the serviceIds by organization fiscal codes
 */

import { fromNullable } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";

import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { clearCache } from "../../../actions/profile";
import { loadService, removeServiceTuples } from "../../../actions/services";
import { Action } from "../../../actions/types";

/**
 * Maps organization fiscal code to serviceId
 */
export type ServiceIdsByOrganizationFiscalCodeState = Readonly<{
  [key: string]: ReadonlyArray<ServiceId> | undefined;
}>;

const INITIAL_STATE: ServiceIdsByOrganizationFiscalCodeState = {};

export function serviceIdsByOrganizationFiscalCodeReducer(
  state: ServiceIdsByOrganizationFiscalCodeState = INITIAL_STATE,
  action: Action
): ServiceIdsByOrganizationFiscalCodeState {
  switch (action.type) {
    case getType(loadService.success):
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
      const serviceTuples = action.payload;

      // Remove service id fromt the array keyed by organizationFiscalCode
      const stateUpdate = serviceTuples.reduce<
        ServiceIdsByOrganizationFiscalCodeState
      >((accumulator, tuple) => {
        const serviceId = tuple.e1;
        const organizationFiscalCode = tuple.e2;
        const ids = fromNullable(organizationFiscalCode)
          .map(_ => (accumulator[_] !== undefined ? accumulator[_] : state[_]))
          .toNullable();
        if (organizationFiscalCode && ids) {
          const filteredIds = ids.filter(id => id !== serviceId);
          return {
            ...accumulator,
            [organizationFiscalCode]: filteredIds
          };
        }
        return accumulator;
      }, {});

      return {
        ...state,
        ...stateUpdate
      };
    }

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
}
