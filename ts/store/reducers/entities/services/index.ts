/**
 * Services reducer
 */
import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { ScopeEnum } from "../../../../../definitions/content/Service";
import { Service as ServiceMetadata } from "../../../../../definitions/content/Service";
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

/**
 * The function returns:
 * - pot.none if visibleServices is not loaded or the related services load is not yet started
 * - pot.noneLoading if visibleServices or at least one visible service is loading
 * - pot.noneError if visibleServices or at least one visible service load fails
 * - pot.some if both visible services and all services load successfully
 * @param visibleServices - list of visible services
 * @param services - collection of services related data indexed with respect to the services id
 *                   (applied for entities.services.byId state and content.servicesMetadata.byId)
 */
function getServicesLoadState<T>(
  visibleServices: VisibleServicesState,
  services: Readonly<{
    [key: string]: pot.Pot<T, Error> | undefined;
  }>
): pot.Pot<void, Error> {
  if (pot.isSome(visibleServices) && services !== {}) {
    const visibleServicesById = visibleServices.value.map(
      service => services[service.service_id]
    );

    const areServicesLoading =
      pot.isLoading(visibleServices) ||
      visibleServicesById.findIndex(vs => {
        return vs === undefined || pot.isLoading(vs);
      }) !== -1;

    const isServicesLoadFailed =
      pot.isError(visibleServices) ||
      visibleServicesById.findIndex(service => {
        return service !== undefined && pot.isError(service);
      }) !== -1;

    if (areServicesLoading) {
      return pot.noneLoading;
    } else if (isServicesLoadFailed) {
      return pot.noneError(Error(`Unable to load one or more services`));
    } else {
      return pot.some(undefined);
    }
  }

  // If visibleServices is none
  if (pot.isLoading(visibleServices)) {
    return pot.noneLoading;
  } else if (pot.isError(visibleServices)) {
    return pot.noneError(Error("Unable to load visible services"));
  } else {
    return pot.none;
  }
}

// A selector to monitor the state of the service content loading
export const visibleServicesContentLoadStateSelector = createSelector(
  [servicesByIdSelector, visibleServicesSelector],
  (servicesById, visibleServices) =>
    getServicesLoadState<ServicePublic>(visibleServices, servicesById)
);

// A selector to monitor the state of the service metadata loading
export const visibleServicesMetadataLoadStateSelector = createSelector(
  [servicesMetadataByIdSelector, visibleServicesSelector],
  (servicesMetadataById, visibleServices) =>
    getServicesLoadState<ServiceMetadata | undefined>(
      visibleServices,
      servicesMetadataById
    )
);

/**
 * A selector to get the organizations selected by the user as areas of interests
 */

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

/**
 * Functions and selectors to get services organized in sections
 */

// Check if the passed service is local or national through data included into the service metadata.
// If the scope parameter is expressed, the corresponding item is not included into section if:
// -  the scope paramenter is different to the service scope
// -  service metadata load fails,
const isInScope = (
  service: pot.Pot<ServicePublic, Error>,
  servicesMetadataById: ServiceMetadataById,
  scope?: ScopeEnum
) => {
  if (scope === undefined) {
    return true;
  }

  // if service is Error, the corresponding item is not included into section
  if (pot.isSome(service)) {
    const potServiceMetadata =
      servicesMetadataById[service.value.service_id] || pot.none;
    if (pot.isSome(potServiceMetadata) && potServiceMetadata.value) {
      return potServiceMetadata.value.scope === scope;
    }
  }
  return false;
};

/**
 * A generalized function to generate sections of organizations including the available services for each organization
 * optional input:
 * - scope: if undefined, all available organizations are included. If expressed, it requires service metadata being loaded
 * - organizationsFiscalCodesSelected: if provided, sections will include only the passed organizations
 */
const getServices = (
  services: ServicesState,
  visibleServices: VisibleServicesState,
  organizations: OrganizationNamesByFiscalCodeState,
  servicesMetadata: {
    byId: ServiceMetadataById;
  },
  scope?: ScopeEnum,
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
            isInScope(service, servicesMetadata.byId, scope) &&
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

/**
 *  Get the sum of selected local services + national services that are not yet marked as read
 */

export const servicesBadgeValueSelector = createSelector(
  [
    nationalServicesSectionsSelector,
    selectedLocalServicesSectionsSelector,
    readServicesByIdSelector,
    visibleServicesContentLoadStateSelector,
    visibleServicesMetadataLoadStateSelector
  ],
  (
    nationalService,
    localService,
    readServicesById,
    visibleServicesContentLoadState,
    visibleServicesMetadataLoadState
  ) => {
    if (
      pot.isSome(visibleServicesContentLoadState) &&
      pot.isSome(visibleServicesMetadataLoadState)
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
