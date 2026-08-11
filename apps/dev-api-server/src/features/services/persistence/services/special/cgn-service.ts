import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";

import { ScopeTypeEnum } from "../../../../../../generated/definitions/services/ScopeType";
import { ServiceDetails } from "../../../../../../generated/definitions/services/ServiceDetails";
import { ServiceId } from "../../../../../../generated/definitions/services/ServiceId";
import { ServiceMetadata } from "../../../../../../generated/definitions/services/ServiceMetadata";
import { SpecialServiceCategoryEnum } from "../../../../../../generated/definitions/services/SpecialServiceCategory";
import { SpecialServiceMetadata } from "../../../../../../generated/definitions/services/SpecialServiceMetadata";
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
