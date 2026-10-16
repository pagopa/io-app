import { ScopeTypeEnum } from "@io-app/api-types/generated/definitions/services/ScopeType";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { StandardServiceCategoryEnum } from "@io-app/api-types/generated/definitions/services/StandardServiceCategory";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "@pagopa/ts-commons/lib/strings";
import { merge } from "lodash";

import { ServiceType } from "../types";

const SERVICE_ID = "serviceId" as ServiceId;
const FISCAL_CODE = "12345678901" as OrganizationFiscalCode;

export const createMockService = (
  props: Partial<ServiceType> = {}
): ServiceType =>
  merge(
    {},
    {
      id: SERVICE_ID,
      name: "ServiceName",
      institution: {
        fiscal_code: FISCAL_CODE,
        name: "InstitutionName"
      }
    },
    props
  );

export const createMockServiceDetails = (
  props: Partial<ServiceDetails> = {}
): ServiceDetails =>
  merge(
    {},
    {
      id: SERVICE_ID,
      description: "Desc",
      metadata: {
        category: StandardServiceCategoryEnum.STANDARD,
        scope: ScopeTypeEnum.NATIONAL
      },
      name: "ServiceName",
      organization: {
        fiscal_code: FISCAL_CODE,
        name: "InstitutionName" as NonEmptyString
      }
    },
    props
  );
