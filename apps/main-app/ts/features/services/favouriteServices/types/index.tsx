import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";

export type FavouriteServicesSortType =
  | "addedAt_asc"
  | "addedAt_desc"
  | "name_asc";

export type FavouriteServiceType = ServiceType & {
  /**
   * The timestamp, in milliseconds, representing when the service
   * was added to the favourites.
   */
  addedAt: number;
};

export type ServiceType = {
  id: ServiceId;
  institution: InstitutionType;
  name: string;
};

type InstitutionType = {
  fiscal_code: OrganizationFiscalCode;
  name: string;
};
