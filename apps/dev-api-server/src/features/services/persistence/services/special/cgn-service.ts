import { ScopeTypeEnum } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { ServiceMetadata } from "@io-app/api-types/generated/definitions/services/ServiceMetadata";
import { SpecialServiceCategoryEnum } from "@io-app/api-types/generated/definitions/services/SpecialServiceCategory";
import { SpecialServiceMetadata } from "@io-app/api-types/generated/definitions/services/SpecialServiceMetadata";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";

import { SpecialServiceGenerator } from "../factory";

export const cgnServiceId = "serviceCgn" as ServiceId;

export const createCgnService: SpecialServiceGenerator = (
  createService: (serviceId: string) => ServiceDetails,
  createServiceMetadata: (scope: ScopeTypeEnum) => ServiceMetadata,
  organizationFiscalCode: OrganizationFiscalCode
): ServiceDetails => ({
  ...createService(cgnServiceId),
  organization: {
    fiscal_code: organizationFiscalCode,
    name: "PCM - Dipartimento per le Politche Giovanili e il Servizio Civile Universale" as NonEmptyString
  },
  metadata: {
    ...createServiceMetadata(ScopeTypeEnum.NATIONAL),
    category: SpecialServiceCategoryEnum.SPECIAL,
    custom_special_flow: "cgn" as SpecialServiceMetadata["custom_special_flow"]
  },
  name: "Carta Giovani Nazionale" as NonEmptyString
});
