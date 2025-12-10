import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";

type InstitutionType = {
  name: string;
  fiscal_code: OrganizationFiscalCode;
};

export type ServiceType = {
  id: string;
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
