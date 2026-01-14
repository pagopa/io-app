import { merge } from "lodash";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ServiceType } from "../types";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { StandardServiceCategoryEnum } from "../../../../../definitions/services/StandardServiceCategory";
import { ScopeTypeEnum } from "../../../../../definitions/services/ScopeType";
import { OrganizationName } from "../../../../../definitions/backend/OrganizationName";

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
        name: "InstitutionName" as OrganizationName
      }
    },
    props
  );
