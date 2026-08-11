import { Institutions } from "@io-app/api-types/generated/definitions/services/Institutions";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";

import { ioDevServerConfig } from "../../../config";
import ServicesDB from "../persistence/servicesDatabase";
import { getInstitutions } from "../utils/institutions";

const featuredInstitutionsSize =
  ioDevServerConfig.features.service.featuredInstitutionsSize;

export const getFeaturedInstitutionsResponsePayload = (): Institutions => {
  // take some casual institutions
  const selectedInstitutions = _.sampleSize(
    pipe(ServicesDB.getAllServices(), getInstitutions),
    featuredInstitutionsSize
  );

  const featuredIntitutions = pipe(
    selectedInstitutions,
    A.map(institution => ({
      id: institution.id,
      name: institution.name,
      fiscal_code: institution.fiscal_code
    }))
  );

  return {
    institutions: featuredIntitutions
  };
};
