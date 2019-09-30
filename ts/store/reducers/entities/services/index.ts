/**
 * Services reducer
 */
import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { ScopeEnum } from "../../../../../definitions/content/Service";
import { isDefined } from "../../../../utils/guards";
import { Action } from "../../../actions/types";
import { ServiceMetadataById, servicesMetadataSelector } from "../../content";
import { GlobalState } from "../../types";
import { organizationsOfInterestSelector } from "../../userMetadata";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../organizations/organizationsByFiscalCodeReducer";
import {
  firstLoadingReducer,
  FirstLoadingState,
  isVisibleServicesContentLoadCompletedSelector,
  isVisibleServicesMetadataLoadCompletedSelector
} from "./firstServicesLoading";
import readServicesByIdReducer, {
  ReadStateByServicesId
} from "./readStateByServiceId";
import servicesByIdReducer, { ServicesByIdState } from "./servicesById";
import {
  serviceIdsByOrganizationFiscalCodeReducer,
  ServiceIdsByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";
import {
  visibleServicesReducer,
  visibleServicesSelector,
  VisibleServicesState
} from "./visibleServices";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  byOrgFiscalCode: ServiceIdsByOrganizationFiscalCodeState;
  visible: VisibleServicesState;
  readState: ReadStateByServicesId;
  firstLoading: FirstLoadingState;
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
  readState: readServicesByIdReducer,
  firstLoading: firstLoadingReducer
});

// Selectors
export const servicesSelector = (state: GlobalState) => state.entities.services;

// Selector to get if services content and metadata are still being loaded
export const isLoadingServicesSelector = createSelector(
  [
    isVisibleServicesContentLoadCompletedSelector,
    isVisibleServicesMetadataLoadCompletedSelector,
    visibleServicesSelector
  ],
  (
    isVisibleServicesContentLoadCompleted,
    isVisibleServicesMetadataLoadCompleted,
    visibleServices
  ) =>
    pot.isLoading(visibleServices) ||
    (pot.isSome(visibleServices) &&
      (!isVisibleServicesContentLoadCompleted ||
        !isVisibleServicesMetadataLoadCompleted))
);

//
// Functions and selectors to get services organized in sections
//

// Check if the passed service is local or national through data included into the service metadata.
// If service metadata aren't loaded, the service is treated as local, otherwise it returns
// true  if service scope is equal to the filter localization parameter
const hasLocalization = (
  service: pot.Pot<ServicePublic, Error>,
  servicesMetadataById: ServiceMetadataById,
  localization?: ScopeEnum
) => {
  if (localization === undefined) {
    return true;
  }

  if (pot.isSome(service)) {
    const potServiceMetadata =
      servicesMetadataById[service.value.service_id] || pot.none;
    if (pot.isSome(potServiceMetadata)) {
      return potServiceMetadata.value.scope === localization;
    } else {
      return localization === ScopeEnum.LOCAL; // if metadata load fails, the service is treated as local
    }
  } else {
    return false; // if service is Error, the corresponding item is not included into section
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
  localization?: ScopeEnum,
  selectedOrganizationsFiscalCodes?: ReadonlyArray<string>
) => {
  const organizationsFiscalCodes =
    selectedOrganizationsFiscalCodes === undefined
      ? Object.keys(services.byOrgFiscalCode)
      : selectedOrganizationsFiscalCodes;

  return organizationsFiscalCodes
    .map((fiscalCode: string) => {
      const organizationName = organizations[fiscalCode] || fiscalCode;
      const organizationFiscalCode = fiscalCode;
      const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];

      const data = serviceIdsForOrg
        .map(id => services.byId[id])
        .filter(isDefined)
        .filter(service =>
          hasLocalization(service, servicesMetadata.byId, localization)
        )
        .sort((a, b) =>
          (a as any).value.service_name
            .toLocaleLowerCase()
            .localeCompare((b as any).value.service_name.toLocaleLowerCase())
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
export const nationalServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) =>
    getServices(services, organizations, servicesMetadata, ScopeEnum.NATIONAL)
);

// A selector providing sections related to local services
export const localServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) =>
    getServices(services, organizations, servicesMetadata, ScopeEnum.LOCAL)
);

// A selector providing sections related to the organizations selected by the user
export const selectedLocalServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector,
    organizationsOfInterestSelector
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

// A selector providing sections related to:
// - all national services
// - local services not included into the user areas of interest
export const notSelectedServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector,
    organizationsOfInterestSelector
  ],
  (services, organizations, servicesMetadata, selectedOrganizations) => {
    // tslint:disable-next-line:no-let
    let notSelectedOrganizations;
    if (organizations !== undefined) {
      notSelectedOrganizations = Object.keys(organizations).filter(
        fiscalCode =>
          selectedOrganizations &&
          selectedOrganizations.indexOf(fiscalCode) === -1
      );
    }

    return getServices(
      services,
      organizations,
      servicesMetadata,
      undefined,
      notSelectedOrganizations
    );
  }
);

export default reducer;
