/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { clearCache } from "../../../actions/profile";
import { loadService, removeServiceTuples } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type ServicesByIdState = Readonly<{
  [key: string]: pot.Pot<ServicePublic, Error> | undefined;
}>;

const INITIAL_STATE: ServicesByIdState = {};

const reducer = (
  state: ServicesByIdState = INITIAL_STATE,
  action: Action
): ServicesByIdState => {
  switch (action.type) {
    case getType(loadService.request):
      // Use the ID as object key
      const cachedValue = state[action.payload];
      const prevServiceRequest =
        cachedValue && pot.isSome(cachedValue) && !pot.isLoading(cachedValue)
          ? pot.someLoading(cachedValue.value)
          : pot.noneLoading;

      return {
        ...state,
        [action.payload]: prevServiceRequest
      };

    case getType(loadService.success):
      // Use the ID as object key
      return {
        ...state,
        [action.payload.service_id]: pot.some(action.payload)
      };

    case getType(loadService.failure):
      // Use the ID as object key
      const { service_id, to_remove, error = Error() } = action.payload;
      const prevServiceFailure = state[service_id];
      if (to_remove) {
        const clonedState = { ...state }; // tslint:disable-next-line: no-object-mutation
        delete clonedState[service_id];
        return clonedState;
      }
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
      // tslint:disable-next-line: no-object-mutation
      serviceTuples.forEach(_ => delete newState[_.e1]);
      return newState;
    }

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors
export const servicesByIdSelector = (state: GlobalState): ServicesByIdState => {
  return state.entities.services.byId;
};

export const serviceByIdSelector = (id: string) => (
  state: GlobalState
): pot.Pot<ServicePublic, Error> | undefined =>
  state.entities.services.byId[id];

export default reducer;
