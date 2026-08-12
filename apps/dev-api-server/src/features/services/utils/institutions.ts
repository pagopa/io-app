import { Institution } from "@io-app/api-types/generated/definitions/services/Institution";
import { ScopeTypeEnum } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";

export type InstitutionWithScope = Institution & { scope?: ScopeTypeEnum };

export const getInstitutions = (
  services: Array<ServiceDetails>
): Array<InstitutionWithScope> =>
  pipe(
    services,
    A.uniq({
      equals: (x, y) =>
        x.organization.fiscal_code === y.organization.fiscal_code
    }),
    A.map(service => ({
      id: service.organization.fiscal_code,
      name: service.organization.name,
      fiscal_code: service.organization.fiscal_code,
      scope: service.metadata.scope
    }))
  );
