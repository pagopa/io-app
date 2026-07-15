import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";

import { ServiceId } from "../../../../../definitions/services/ServiceId";

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
