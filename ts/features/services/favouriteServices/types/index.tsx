import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

type InstitutionType = {
  name: string;
  fiscal_code: OrganizationFiscalCode;
};

export type ServiceType = {
  id: ServiceId;
  name: string;
  institution: InstitutionType;
};

export type FavouriteServiceType = ServiceType & {
  /**
   * The timestamp, in milliseconds, representing when the service
   * was added to the favourites.
   */
  addedAt: number;
};

export type FavouriteServicesSortType =
  | "addedAt_asc"
  | "addedAt_desc"
  | "name_asc";
