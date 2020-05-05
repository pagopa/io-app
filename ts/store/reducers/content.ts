/**
 * Implements the reducers for static content.
 *
 * TODO: add eviction of old entries
 * https://www.pivotaltracker.com/story/show/159440294
 */
import * as pot from "italia-ts-commons/lib/pot";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import {
  ScopeEnum,
  Service as ServiceMetadata
} from "../../../definitions/content/Service";
import { ServicesByScope } from "../../../definitions/content/ServicesByScope";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import {
  contentMunicipalityLoad,
  loadServiceMetadata,
  loadVisibleServicesByScope
} from "../actions/content";
import { clearCache } from "../actions/profile";
import { removeServiceTuples } from "../actions/services";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

/**
 * Stores useful content such as services and organizations metadata,
 * help pages, etc...
 */
export type ContentState = Readonly<{
  servicesMetadata: {
    byId: ServiceMetadataById;
  };
  municipality: MunicipalityState;
  servicesByScope: pot.Pot<ServicesByScope, Error>;
}>;

export type MunicipalityState = Readonly<{
  codiceCatastale: pot.Pot<CodiceCatastale, Error>;
  data: pot.Pot<MunicipalityMetadata, Error>;
}>;

export type ServiceMetadataState = pot.Pot<ServiceMetadata | undefined, Error>;

export type ServiceMetadataById = Readonly<{
  [key: string]: ServiceMetadataState;
}>;

const initialContentState: ContentState = {
  servicesMetadata: {
    byId: {}
  },
  municipality: {
    codiceCatastale: pot.none,
    data: pot.none
  },
  servicesByScope: pot.none
};

// Selectors
export const contentSelector = (state: GlobalState) => state.content;

export const servicesMetadataSelector = (state: GlobalState) =>
  state.content.servicesMetadata;

export const municipalitySelector = (state: GlobalState) =>
  state.content.municipality;

export const servicesMetadataByIdSelector = (state: GlobalState) =>
  state.content.servicesMetadata.byId;

export const serviceMetadataByIdSelector = (serviceId: string) => (
  state: GlobalState
) => servicesMetadataByIdSelector(state)[serviceId];

export const servicesByScopeSelector = (state: GlobalState) =>
  state.content.servicesByScope;

/**
 * returns true if the given serviceId is contained in the relative scope
 * @param serviceId
 * @param scope
 */
export const isServiceIdInScopeSelector = (
  serviceId: ServiceId,
  scope: ScopeEnum
) =>
  createSelector(servicesByScopeSelector, maybeServicesByScope =>
    pot.getOrElse(
      pot.map(
        maybeServicesByScope,
        sbs => sbs[scope].indexOf(serviceId) !== -1
      ),
      false
    )
  );

/**
 * returns true if the given service is contained in the relative scope
 * @param service
 * @param scope
 */
export const isServiceInScopeSelector = (
  service: ServicePublic,
  scope: ScopeEnum
) => isServiceIdInScopeSelector(service.service_id, scope);

/**
 * from the given services returns only these contained in the given scope
 * @param services
 * @param scope
 */
export const servicesInScopeSelector = (
  services: ReadonlyArray<ServicePublic>,
  scope: ScopeEnum
) =>
  createSelector(servicesByScopeSelector, maybeServicesByScope =>
    pot.getOrElse(
      pot.map(maybeServicesByScope, sbs =>
        services.filter(service => {
          return sbs[scope].some(sId => sId === service.service_id);
        })
      ),
      []
    )
  );

export default function content(
  state: ContentState = initialContentState,
  action: Action
): ContentState {
  switch (action.type) {
    case getType(loadServiceMetadata.request):
      return {
        ...state,
        servicesMetadata: {
          byId: {
            ...state.servicesMetadata.byId,
            [action.payload]: pot.toLoading(
              state.servicesMetadata.byId[action.payload] || pot.none
            )
          }
        }
      };
    case getType(loadServiceMetadata.success):
      return {
        ...state,
        servicesMetadata: {
          byId: {
            ...state.servicesMetadata.byId,
            [action.payload.serviceId]: action.payload.data
          }
        }
      };

    case getType(loadServiceMetadata.failure):
      return {
        ...state,
        servicesMetadata: {
          byId: {
            ...state.servicesMetadata.byId,
            [action.payload.serviceId]: pot.toError(
              state.servicesMetadata.byId[action.payload.serviceId] || pot.none,
              action.payload.error
            )
          }
        }
      };

    case getType(contentMunicipalityLoad.request):
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.noneLoading,
          data: pot.noneLoading
        }
      };

    case getType(contentMunicipalityLoad.success):
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.some(action.payload.codiceCatastale),
          data: pot.some(action.payload.data)
        }
      };

    case getType(contentMunicipalityLoad.failure):
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.toError(
            state.municipality.codiceCatastale,
            action.payload
          ),
          data: pot.toError(state.municipality.data, action.payload)
        }
      };

    // services by scope
    case getType(loadVisibleServicesByScope.request):
      return {
        ...state,
        servicesByScope: pot.toLoading(state.servicesByScope)
      };

    case getType(loadVisibleServicesByScope.success):
      return {
        ...state,
        servicesByScope: pot.some(action.payload)
      };

    case getType(loadVisibleServicesByScope.failure):
      return {
        ...state,
        servicesByScope: pot.toError(state.servicesByScope, action.payload)
      };

    case getType(clearCache):
      return {
        ...state,
        servicesMetadata: { ...initialContentState.servicesMetadata },
        municipality: { ...initialContentState.municipality }
      };

    case getType(removeServiceTuples): {
      // removeServiceTuples is dispatched to remove from the store
      // the service detail (and, here, metadata) related to services that are
      // no more visible and that are not related to messages list

      // references of the services to be removed from the store
      const serviceTuples: ReadonlyArray<ITuple2<string, string | undefined>> =
        action.payload;

      const newServicesMetadataByIdState = {
        ...state.servicesMetadata.byId
      };
      serviceTuples.forEach(
        // tslint:disable-next-line no-object-mutation
        tuple => delete newServicesMetadataByIdState[tuple.e1]
      );
      return {
        ...state,
        servicesMetadata: {
          byId: newServicesMetadataByIdState
        }
      };
    }

    default:
      return state;
  }
}
