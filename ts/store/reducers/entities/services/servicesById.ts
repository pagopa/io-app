/**
 * A reducer to store the services detail normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  ServicePublic,
  ServicePublicService_metadata
} from "../../../../../definitions/backend/ServicePublic";
import {
  loadServiceDetail,
  removeServiceTuples
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

export type ServicesByIdState = Readonly<{
  [key: string]: pot.Pot<ServicePublic, Error> | undefined;
}>;

const INITIAL_STATE: ServicesByIdState = {};

const reducer = (
  state: ServicesByIdState = INITIAL_STATE,
  action: Action
): ServicesByIdState => {
  switch (action.type) {
    case getType(loadServiceDetail.request):
      // When a previously loaded service detail is loaded again, its state
      // is updated with a someLoading pot, otherwise its state is updated with a noneLoading pot
      const cachedValue = state[action.payload];
      const prevServiceRequest =
        cachedValue && pot.isSome(cachedValue) && !pot.isLoading(cachedValue)
          ? pot.someLoading(cachedValue.value)
          : pot.noneLoading;

      return {
        ...state,
        [action.payload]: prevServiceRequest
      };

    case getType(loadServiceDetail.success):
      // Use the ID as object key
      return {
        ...state,
        [action.payload.service_id]: pot.some(action.payload)
      };

    case getType(loadServiceDetail.failure):
      // when a request to load a previously loaded service detail fails its state is updated
      // with a someError pot, otherwise its state is updated with a noneError pot
      const { service_id, error } = action.payload;
      const prevServiceFailure = state[service_id];
      const nextServiceFailure =
        prevServiceFailure !== undefined && pot.isSome(prevServiceFailure)
          ? pot.someError(prevServiceFailure.value, error)
          : pot.noneError(error);
      return {
        ...state,
        [service_id]: nextServiceFailure
      };

    case getType(removeServiceTuples): {
      const serviceTuples = action.payload;
      const newState = { ...state };
      // eslint-disable-next-line
      serviceTuples.forEach(_ => delete newState[_.e1]);
      return newState;
    }

    default:
      return state;
  }
};

// Selectors
export const servicesByIdSelector = (state: GlobalState): ServicesByIdState =>
  state.entities.services.byId;

export const serviceByIdSelector =
  (id: ServiceId) =>
  (state: GlobalState): pot.Pot<ServicePublic, Error> | undefined =>
    state.entities.services.byId[id];

export const serviceMetadataByIdSelector =
  (id: ServiceId) =>
  (state: GlobalState): ServicePublicService_metadata | undefined => {
    const maybeServiceById = serviceByIdSelector(id)(state);

    return maybeServiceById
      ? pot.toUndefined(maybeServiceById)?.service_metadata
      : undefined;
  };
export default reducer;
