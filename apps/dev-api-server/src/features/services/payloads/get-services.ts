import { InstitutionServicesResource } from "@io-app/api-types/generated/definitions/services/InstitutionServicesResource";
import { ServiceMinified } from "@io-app/api-types/generated/definitions/services/ServiceMinified";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";

import ServicesDB from "../persistence/servicesDatabase";

export const getServicesByInstitutionIdResponsePayload = (
  institutionId: string,
  limit = 20,
  offset = 0
): O.Option<InstitutionServicesResource> => {
  const filteredServices: Array<ServiceMinified> = pipe(
    ServicesDB.getAllServices(),
    A.filterMap(({ id, organization, name }) => {
      if (organization.fiscal_code === institutionId) {
        return O.some({
          id,
          name,
          version: 1
        });
      }
      return O.none;
    })
  );

  const totalElements = filteredServices.length;
  const startIndex = offset;
  const endIndex = offset + limit;
  const servicesList = _.slice(filteredServices, startIndex, endIndex);

  return O.some({
    services: servicesList,
    limit,
    offset,
    count: totalElements
  });
};
