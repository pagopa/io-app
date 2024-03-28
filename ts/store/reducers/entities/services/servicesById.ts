/**
 * A reducer to store the services detail normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { logoutSuccess, sessionExpired } from "../../../actions/authentication";
import {
  loadServiceDetail,
  removeServiceTuples
} from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../../definitions/backend/ServiceMetadata";

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
      return {
        ...state,
        [action.payload]: pipe(
          state[action.payload],
          O.fromNullable,
          O.fold(() => pot.noneLoading, pot.toLoading)
        )
      };

    case getType(loadServiceDetail.success):
      // Use the ID as object key
      return {
        ...state,
        [action.payload.service_id]: pot.some(action.payload)
      };
    case getType(logoutSuccess):
    case getType(sessionExpired):
      return INITIAL_STATE;

    case getType(loadServiceDetail.failure):
      // when a request to load a previously loaded service detail fails its state is updated
      // with a someError pot, otherwise its state is updated with a noneError pot
      return {
        ...state,
        [action.payload.service_id]: pipe(
          state[action.payload.service_id],
          O.fromNullable,
          O.fold(
            () => pot.noneError(action.payload.error),
            servicePot => pot.toError(servicePot, action.payload.error)
          )
        )
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

export const serviceByIdSelector = (
  state: GlobalState,
  id: ServiceId
): pot.Pot<ServicePublic, Error> =>
  state.entities.services.byId[id] ?? pot.none;

export const serviceMetadataByIdSelector = (
  state: GlobalState,
  id: ServiceId
): ServiceMetadata | undefined =>
  pipe(
    serviceByIdSelector(state, id),
    pot.toOption,
    O.chainNullableK(service => service.service_metadata),
    O.toUndefined
  );

export default reducer;
