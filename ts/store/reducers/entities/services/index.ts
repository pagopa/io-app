/**
 * Services reducer
 */
import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { ScopeEnum } from "../../../../../definitions/content/Service";
import { isDefined } from "../../../../utils/guards";
import { isVisibleService } from "../../../../utils/services";
import { Action } from "../../../actions/types";
import {
  ServiceMetadataById,
  servicesMetadataByIdSelector,
  servicesMetadataSelector
} from "../../content";
import { GlobalState } from "../../types";
import { userMetadataSelector } from "../../userMetadata";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../organizations/organizationsByFiscalCodeReducer";
import { firstLoadingReducer, FirstLoadingState } from "./firstServicesLoading";
import { isFirstVisibleServiceLoadCompletedSelector } from "./firstServicesLoading";
import readServicesByIdReducer, {
  readServicesByIdSelector,
  ReadStateByServicesId
} from "./readStateByServiceId";
import servicesByIdReducer, {
  servicesByIdSelector,
  ServicesByIdState
} from "./servicesById";
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

/**
 * Selectors
 */

export const servicesSelector = (state: GlobalState) => state.entities.services;

// TODO: the following 3 seletors (isVisibleServicesContentLoadCompletedSelector,
// isAnyServicesContentLoadFailedSelector, isVisibleServicesMetadataLoadCompletedSelector)
// could be integrated giving as output a pot instead of a bool
export const isVisibleServicesContentLoadCompletedSelector = createSelector(
  [servicesByIdSelector, visibleServicesSelector],
  (servicesById, visibleServices) => {
    if (!pot.isSome(visibleServices)) {
      return false;
    }
    const servicesLoading = visibleServices.value.findIndex(service => {
      const serviceContent = servicesById[service.service_id];
      return serviceContent === undefined || pot.isLoading(serviceContent);
    });
    return servicesLoading === -1;
  }
);

export const isAnyServicesContentLoadFailedSelector = createSelector(
  [
    visibleServicesSelector,
    isFirstVisibleServiceLoadCompletedSelector,
    isVisibleServicesContentLoadCompletedSelector,
    servicesByIdSelector
  ],
  (
    visibleServices,
    isFirstServiceLoading,
    isVisibleServicesContentLoadCompleted,
    servicesById
  ) => {
    if (
      pot.isNone(isFirstServiceLoading) &&
      pot.isSome(visibleServices) &&
      isVisibleServicesContentLoadCompleted
    ) {
      return (
        visibleServices.value.findIndex(service => {
          const serviceContent = servicesById[service.service_id];
          return serviceContent !== undefined && pot.isError(serviceContent);
        }) !== -1
      );
    } else {
      return undefined;
    }
  }
);

export const isVisibleServicesMetadataLoadCompletedSelector = createSelector(
  [servicesMetadataByIdSelector, visibleServicesSelector],
  (servicesMetadataById, visibleServices) => {
    if (!pot.isSome(visibleServices)) {
      return false;
    }
    const servicesLoading = visibleServices.value.findIndex(service => {
      const serviceMetadata = servicesMetadataById[service.service_id];
      return serviceMetadata === undefined || pot.isLoading(serviceMetadata);
    });
    return servicesLoading === -1;
  }
);

// A selector to get the organizations selected by the user as areas of interests
export const organizationsOfInterestSelector = createSelector(
  [userMetadataSelector, servicesSelector],
  (potUserMetadata, services) => {
    const visibleServices = new Set<string>(
      pot.getOrElse(services.visible, []).map(_ => _.service_id)
    );

    // If the user never select areas of interest, return an undefined object
    return pot.toUndefined(
      pot.map(
        potUserMetadata,
        _ =>
          // filter organization by selecting those ones have
          // at least 1 visible service inside
          _.metadata.organizationsOfInterest
            ? _.metadata.organizationsOfInterest.filter(org => {
                const organizationServices =
                  services.byOrgFiscalCode[org] || [];
                return organizationServices.some(serviceId =>
                  visibleServices.has(serviceId)
                );
              })
            : []
      )
    );
  }
);

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
      !pot.isError(visibleServices) &&
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
  visibleServices: VisibleServicesState,
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
        .filter(
          service =>
            isDefined(service) &&
            hasLocalization(service, servicesMetadata.byId, localization) &&
            isVisibleService(visibleServices, service)
        )
        .sort(
          (a, b) =>
            a && pot.isSome(a) && b && pot.isSome(b)
              ? a.value.service_name
                  .toLocaleLowerCase()
                  .localeCompare(b.value.service_name.toLocaleLowerCase())
              : 0
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
    visibleServicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, visibleServices, organizations, servicesMetadata) =>
    getServices(
      services,
      visibleServices,
      organizations,
      servicesMetadata,
      ScopeEnum.NATIONAL
    )
);

// A selector providing sections related to local services
export const localServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    visibleServicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, visibleServices, organizations, servicesMetadata) =>
    getServices(
      services,
      visibleServices,
      organizations,
      servicesMetadata,
      ScopeEnum.LOCAL
    )
);

// A selector providing sections related to the organizations selected by the user
export const selectedLocalServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    visibleServicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector,
    organizationsOfInterestSelector
  ],
  (
    services,
    visibleServices,
    organizations,
    servicesMetadata,
    selectedOrganizations
  ) =>
    getServices(
      services,
      visibleServices,
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
    visibleServicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector,
    organizationsOfInterestSelector
  ],
  (
    services,
    visibleServices,
    organizations,
    servicesMetadata,
    selectedOrganizations
  ) => {
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
      visibleServices,
      organizations,
      servicesMetadata,
      undefined,
      notSelectedOrganizations
    );
  }
);

// Get the sum of selected local services + national services that are not yet marked as read
export const servicesBadgeValueSelector = createSelector(
  [
    nationalServicesSectionsSelector,
    selectedLocalServicesSectionsSelector,
    readServicesByIdSelector,
    isFirstVisibleServiceLoadCompletedSelector
  ],
  (
    nationalService,
    localService,
    readServicesById,
    isFirstVisibleServicesLoadCompleted
  ) => {
    if (
      pot.isSome(isFirstVisibleServicesLoadCompleted) &&
      isFirstVisibleServicesLoadCompleted.value === true
    ) {
      const services: ReadonlyArray<ServicesSectionState> = [
        ...nationalService,
        ...localService
      ];
      return services.reduce((acc: number, service: ServicesSectionState) => {
        const servicesNotRead = service.data.filter(
          data =>
            pot.isSome(data) &&
            readServicesById[data.value.service_id] === undefined
        ).length;
        return acc + servicesNotRead;
      }, 0);
    }
    return 0;
  }
);

export default reducer;
