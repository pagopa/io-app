import { ScopeTypeEnum } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { ServiceMetadata } from "@io-app/api-types/generated/definitions/services/ServiceMetadata";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";

import { SpecialServiceGenerator } from "../factory";

const fciServiceId = "serviceFci" as ServiceId;

export const createFciService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServiceDetails,
  createServiceMetadata: (scope: ScopeTypeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServiceDetails => ({
  ...createService(fciServiceId),
  organization: {
    fiscal_code: organizationFiscalCode,
    name: "Firma con IO" as NonEmptyString
  },
  metadata: {
    ...createServiceMetadata(ScopeTypeEnum.NATIONAL)
  },
  name: "Firma con IO" as NonEmptyString
});
