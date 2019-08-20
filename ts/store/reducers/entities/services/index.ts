/**
 * Services reducer
 */
import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { Service as ServiceMetadata } from "../../../../../definitions/content/Service";
import { isDefined } from "../../../../utils/guards";
import { Action } from "../../../actions/types";
import { ServiceMetadataById, servicesMetadataSelector } from "../../content";
import { GlobalState } from "../../types";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../organizations/organizationsByFiscalCodeReducer";
import {
  organizationsFiscalCodesSelectedStateSelector,
  OrganizationsSelectedState
} from "../organizations/organizationsFiscalCodesSelected";
import readStateByServiceReducer, {
  ReadStateByServicesId
} from "./readStateByServiceId";
import servicesByIdReducer, { ServicesByIdState } from "./servicesById";
import {
  serviceIdsByOrganizationFiscalCodeReducer,
  ServiceIdsByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";
import {
  visibleServicesReducer,
  VisibleServicesState
} from "./visibleServices";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  byOrgFiscalCode: ServiceIdsByOrganizationFiscalCodeState;
  visible: VisibleServicesState;
  readState: ReadStateByServicesId;
}>;

export type ServicesSectionState = Readonly<{
  organizationName: string;
  organizationFiscalCode: string;
  data: ReadonlyArray<pot.Pot<ServicePublic, Error>>;
}>;

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer,
  byOrgFiscalCode: serviceIdsByOrganizationFiscalCodeReducer,
  visible: visibleServicesReducer,
  readState: readStateByServiceReducer
});

// Selectors
export const servicesSelector = (state: GlobalState) => state.entities.services;

// Check if the passed service is local or national throught data included into the service metadata
// Service without metadata are trated as local
const getLocalizedServices = (
  service: pot.Pot<ServicePublic, Error>,
  servicesMetadataById: ServiceMetadataById,
  localization?: "NATIONAL" | "LOCAL"
) => {
  if (localization) {
    const id = pot.isSome(service) ? service.value.service_id : undefined;
    if (id) {
      const potServiceMetadata = servicesMetadataById[id] || pot.none;
      const serviceMetadata: ServiceMetadata = pot.getOrElse(
        potServiceMetadata,
        {} as pot.PotType<typeof potServiceMetadata>
      );
      return serviceMetadata.scope === localization;
    } else {
      return undefined;
    }
  } else {
    return true;
  }
};

/**
 * A generalized function to generate sections of organizations including the available services for each organization
 * optional input:
 * - localization: if undefined, all available organizations are included. If expressed, it requires service metadata being loaded
 * - organizationsFiscalCodesSelected: if provided, sections will include only the passed organizations
 */
const getServices = (
  services: ServicesState,
  organizations: OrganizationNamesByFiscalCodeState,
  servicesMetadata: {
    byId: ServiceMetadataById;
  },
  localization?: "NATIONAL" | "LOCAL",
  organizationsFiscalCodesSelected?: OrganizationsSelectedState
) => {
  const organizationsFiscalCodes =
    organizationsFiscalCodesSelected === undefined
      ? Object.keys(services.byOrgFiscalCode)
      : organizationsFiscalCodesSelected;

  return organizationsFiscalCodes
    .map(fiscalCode => {
      const organizationName = organizations[fiscalCode] || fiscalCode;
      const organizationFiscalCode = fiscalCode;
      const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];

      const data = serviceIdsForOrg
        .map(id => services.byId[id])
        .filter(isDefined)
        .filter(service =>
          getLocalizedServices(service, servicesMetadata.byId, localization)
        );

      return {
        organizationName,
        organizationFiscalCode,
        data
      } as ServicesSectionState;
    })
    .filter(_ => _.data.length > 0)
    .sort((a, b) =>
      a.organizationName
        .toLocaleLowerCase()
        .localeCompare(b.organizationName.toLocaleLowerCase())
    );
};

// A selector providing sections related to national services
export const nationalServiceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) =>
    getServices(services, organizations, servicesMetadata, "NATIONAL")
);

// A selector providing sections related to the organizations selected by the user
export const selectedLocalServiceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector,
    // TODO When https://github.com/teamdigitale/io-app/pull/1260 is merged
    // substitute with this selector "organizationsOfInterestSelector" from UserMetadata
    organizationsFiscalCodesSelectedStateSelector
  ],
  (services, organizations, servicesMetadata, selectedOrganizations) =>
    getServices(
      services,
      organizations,
      servicesMetadata,
      undefined,
      selectedOrganizations
    )
);

export const notSelectedLocalServiceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector,
    // TODO When https://github.com/teamdigitale/io-app/pull/1260 is merged
    // substitute with this selector "organizationsOfInterestSelector" from UserMetadata
    organizationsFiscalCodesSelectedStateSelector
  ],
  (services, organizations, servicesMetadata, selectedOrganizations) => {
    // tslint:disable-next-line:no-let
    let notSelectedOrganizations;
    if (organizations !== undefined) {
      notSelectedOrganizations = Object.keys(organizations).filter(
        fiscalCode => selectedOrganizations.indexOf(fiscalCode) === -1
      );
    }

    return getServices(
      services,
      organizations,
      servicesMetadata,
      "LOCAL",
      notSelectedOrganizations
    );
  }
);

export default reducer;
