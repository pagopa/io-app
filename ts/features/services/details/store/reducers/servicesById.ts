import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import {
  logoutSuccess,
  sessionExpired
} from "../../../../../store/actions/authentication";
import { removeServiceTuples } from "../../../../../store/actions/services";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { SpecialServiceMetadata } from "../../../../../../definitions/backend/SpecialServiceMetadata";
import { loadServiceDetail } from "../actions/details";

export type ServicesByIdState = Readonly<{
  [key: string]: pot.Pot<ServicePublic, Error> | undefined;
}>;

const INITIAL_STATE: ServicesByIdState = {};

/**
 * A reducer to store the services detail normalized by id
 */
const serviceByIdReducer = (
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

    case getType(logoutSuccess):
    case getType(sessionExpired):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default serviceByIdReducer;

// Selectors
export const servicesByIdSelector = (state: GlobalState): ServicesByIdState =>
  state.entities.services.byId;

export const serviceByIdPotSelector = (
  state: GlobalState,
  id: ServiceId
): pot.Pot<ServicePublic, Error> =>
  state.entities.services.byId[id] ?? pot.none;

export const serviceByIdSelector = (
  state: GlobalState,
  id: ServiceId
): ServicePublic | undefined =>
  pipe(serviceByIdPotSelector(state, id), pot.toUndefined);

export const isLoadingServiceByIdSelector = (
  state: GlobalState,
  id: ServiceId
) => pipe(serviceByIdPotSelector(state, id), pot.isLoading);

export const isErrorServiceByIdSelector = (state: GlobalState, id: ServiceId) =>
  pipe(serviceByIdPotSelector(state, id), pot.isError);

export const serviceMetadataByIdSelector = createSelector(
  serviceByIdPotSelector,
  serviceByIdPot =>
    pipe(
      serviceByIdPot,
      pot.toOption,
      O.chainNullableK(service => service.service_metadata),
      O.toUndefined
    )
);

export const serviceMetadataInfoSelector = createSelector(
  serviceMetadataByIdSelector,
  serviceMetadata =>
    pipe(
      serviceMetadata,
      O.fromNullable,
      O.chain(serviceMetadata => {
        if (SpecialServiceMetadata.is(serviceMetadata)) {
          return O.some({
            isSpecialService: true,
            customSpecialFlow: serviceMetadata.custom_special_flow
          });
        }
        return O.none;
      }),
      O.toUndefined
    )
);
