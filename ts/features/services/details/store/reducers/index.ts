import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  logoutSuccess,
  sessionCorrupted,
  sessionExpired
} from "../../../../authentication/common/store/actions";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../types/ServicePreferenceResponse";
import { loadServiceDetail } from "../actions/details";
import {
  loadServicePreference,
  upsertServicePreference
} from "../actions/preference";
import {
  getFavouriteService,
  toggleFavouriteService
} from "../actions/favourite";

export type ServicePreferencePot = pot.Pot<
  ServicePreferenceResponse,
  WithServiceID<NetworkError>
>;

type FavouriteService = pot.Pot<
  boolean,
  WithServiceID<{ error: NetworkError }>
>;

export type ServicesDetailsState = {
  dataById: Record<string, pot.Pot<ServiceDetails, Error>>;
  preferencesById: Record<string, ServicePreferencePot>;
  favouritesById: Record<string, FavouriteService>;
};

const INITIAL_STATE: ServicesDetailsState = {
  dataById: {},
  preferencesById: {},
  favouritesById: {}
};

// eslint-disable-next-line complexity
const reducer = (
  state: ServicesDetailsState = INITIAL_STATE,
  action: Action
): ServicesDetailsState => {
  switch (action.type) {
    // Get service details actions
    case getType(loadServiceDetail.request):
      // When a previously loaded service detail is loaded again, its state
      // is updated with a someLoading pot, otherwise its state is updated with a noneLoading pot
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [action.payload]: pipe(
            state.dataById[action.payload],
            O.fromNullable,
            O.fold(() => pot.noneLoading, pot.toLoading)
          )
        }
      };

    case getType(loadServiceDetail.success):
      // Use the ID as object key
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [action.payload.id]: pot.some(action.payload)
        }
      };

    case getType(loadServiceDetail.failure):
      // when a request to load a previously loaded service detail fails its state is updated
      // with a someError pot, otherwise its state is updated with a noneError pot
      const { service_id, error } = action.payload;
      return {
        ...state,
        dataById: {
          ...state.dataById,
          [service_id]: pipe(
            state.dataById[service_id],
            O.fromNullable,
            O.fold(
              () => pot.noneError(error),
              servicePot => pot.toError(servicePot, error)
            )
          )
        }
      };

    // Get service preference actions
    case getType(loadServicePreference.request):
      const serviceId = action.payload;
      const preferenceToLoad = state.preferencesById[serviceId] ?? pot.none;
      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [serviceId]: pot.toLoading(preferenceToLoad)
        }
      };
    case getType(upsertServicePreference.request):
      const { id, ...payload } = action.payload;
      const preferenceToUpsert = state.preferencesById[id] ?? pot.none;

      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [id]: pot.toUpdating(preferenceToUpsert, {
            id,
            kind: "success",
            value: payload
          })
        }
      };
    case getType(loadServicePreference.success):
    case getType(upsertServicePreference.success):
      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [action.payload.id]: pot.some(action.payload)
        }
      };
    case getType(loadServicePreference.failure):
    case getType(upsertServicePreference.failure):
      const currentPreference =
        state.preferencesById[action.payload.id] ?? pot.none;
      return {
        ...state,
        preferencesById: {
          ...state.preferencesById,
          [action.payload.id]: pot.toError(currentPreference, action.payload)
        }
      };
    // Favourite service actions
    case getType(getFavouriteService.request):
      return {
        ...state,
        favouritesById: {
          ...state.favouritesById,
          [action.payload]: pot.toLoading(
            state.favouritesById[action.payload] ?? pot.none
          )
        }
      };

    case getType(getFavouriteService.success):
      return {
        ...state,
        favouritesById: {
          ...state.favouritesById,
          [action.payload]: pot.some(true)
        }
      };

    case getType(getFavouriteService.failure):
      return {
        ...state,
        favouritesById: {
          ...state.favouritesById,
          [action.payload.id]: pot.someError(false, action.payload)
        }
      };

    case getType(toggleFavouriteService.request):
      // Optimistically update the current value
      // while the request is in progress
      return {
        ...state,
        favouritesById: {
          ...state.favouritesById,
          [action.payload.id]: pot.toUpdating(
            pot.some(action.payload.isFavourite),
            action.payload.isFavourite
          )
        }
      };

    case getType(toggleFavouriteService.success):
    case getType(toggleFavouriteService.failure):
      return {
        ...state,
        favouritesById: {
          ...state.favouritesById,
          [action.payload.id]: pot.some(action.payload.isFavourite)
        }
      };

    case getType(logoutSuccess):
    case getType(sessionExpired):
    case getType(sessionCorrupted):
      return INITIAL_STATE;
  }
  return state;
};

export default reducer;
