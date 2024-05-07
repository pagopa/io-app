import { createSelector } from "reselect";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import {
  ServicePreferenceResponse,
  WithServiceID,
  isServicePreferenceResponseSuccess
} from "../../types/ServicePreferenceResponse";
import { NetworkError } from "../../../../../utils/errors";
import { isStrictSome } from "../../../../../utils/pot";
import {
  loadServicePreference,
  upsertServicePreference
} from "../actions/preference";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";

export type ServicePreferenceState = pot.Pot<
  ServicePreferenceResponse,
  WithServiceID<NetworkError>
>;

const INITIAL_STATE: ServicePreferenceState = pot.none;

/**
 * Reducer to handle specific service contact preferences (inbox, push, emails)
 */
const servicePreferenceReducer = (
  state: ServicePreferenceState = INITIAL_STATE,
  action: Action
): ServicePreferenceState => {
  switch (action.type) {
    case getType(loadServicePreference.request):
      return pot.toLoading(state);
    case getType(upsertServicePreference.request):
      const { id, ...payload } = action.payload;

      return pot.toUpdating(state, {
        id,
        kind: "success",
        value: payload
      });
    case getType(loadServicePreference.success):
    case getType(upsertServicePreference.success):
      return pot.some(action.payload);
    case getType(loadServicePreference.failure):
    case getType(upsertServicePreference.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default servicePreferenceReducer;

// Selectors
export const servicePreferenceSelector = (
  state: GlobalState
): ServicePreferenceState => state.entities.services.servicePreference;

export const servicePreferenceResponseSuccessSelector = createSelector(
  servicePreferenceSelector,
  servicePreferencePot =>
    pipe(
      servicePreferencePot,
      pot.toOption,
      O.filter(isServicePreferenceResponseSuccess),
      O.toUndefined
    )
);

export const isLoadingServicePreferenceSelector = (state: GlobalState) =>
  pipe(
    state,
    servicePreferenceSelector,
    servicePreferencePot =>
      pot.isLoading(servicePreferencePot) ||
      pot.isUpdating(servicePreferencePot)
  );

export const isErrorServicePreferenceSelector = (state: GlobalState) =>
  pipe(
    state,
    servicePreferenceSelector,
    servicePreferencePot =>
      pot.isError(servicePreferencePot) ||
      (isStrictSome(servicePreferencePot) &&
        !isServicePreferenceResponseSuccess(servicePreferencePot.value))
  );
