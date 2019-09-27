/**
 * Implements the reducers for static content.
 *
 * TODO: add eviction of old entries
 * https://www.pivotaltracker.com/story/show/159440294
 */

import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../../definitions/content/Service";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import {
  contentMunicipalityLoad,
  contentServiceLoad
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
}>;

export type MunicipalityState = Readonly<{
  codiceCatastale: pot.Pot<CodiceCatastale, Error>;
  data: pot.Pot<MunicipalityMetadata, Error>;
}>;

export type ServiceMetadataById = Readonly<{
  [key: string]: pot.Pot<ServiceMetadata, string> | undefined;
}>;

const initialContentState: ContentState = {
  servicesMetadata: {
    byId: {}
  },
  municipality: {
    codiceCatastale: pot.none,
    data: pot.none
  }
};

// Selectors
export const municipalitySelector = (state: GlobalState) =>
  state.content.municipality;

export const servicesMetadataByIdSelector = (state: GlobalState) =>
  state.content.servicesMetadata.byId;

export default function content(
  state: ContentState = initialContentState,
  action: Action
): ContentState {
  switch (action.type) {
    case getType(contentServiceLoad.request):
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
    case getType(contentServiceLoad.success):
      return {
        ...state,
        servicesMetadata: {
          byId: {
            ...state.servicesMetadata.byId,
            [action.payload.serviceId]: pot.some(action.payload.data)
          }
        }
      };
    case getType(contentServiceLoad.failure):
      return {
        ...state,
        servicesMetadata: {
          byId: {
            ...state.servicesMetadata.byId,
            [action.payload]: pot.toError(
              state.servicesMetadata.byId[action.payload] || pot.none,
              action.payload
            )
          }
        }
      };

    case getType(contentMunicipalityLoad.request):
      return {
        ...state,
        municipality: {
          codiceCatastale: pot.none,
          data: pot.none
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

    case getType(clearCache):
      return {
        ...state,
        servicesMetadata: { ...initialContentState.servicesMetadata }
      };

    case getType(removeServiceTuples): {
      // removeServiceTuples is dispatched to remove from the store
      // the service content (and, here, metadata) related to services that are
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

// selector
export const servicesMetadataSelector = (state: GlobalState) =>
  state.content.servicesMetadata;
