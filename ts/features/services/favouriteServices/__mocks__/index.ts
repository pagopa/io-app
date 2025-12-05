import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ServiceType } from "../types";

const DEFAULT_SERVICE_ID = "serviceId";
const DEFAULT_FISCAL_CODE = "12345678901" as OrganizationFiscalCode;

export const createMockFavouriteService = (
  props: Partial<ServiceType> = {}
): ServiceType => ({
  id: DEFAULT_SERVICE_ID,
  name: "Service Name",
  institution: {
    fiscal_code: DEFAULT_FISCAL_CODE,
    name: "Institution Name",
    ...props.institution
  },
  ...props
});
