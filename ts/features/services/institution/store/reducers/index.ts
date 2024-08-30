import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { InstitutionServicesResource } from "../../../../../../definitions/services/InstitutionServicesResource";
import { WithInstitutionID, paginatedServicesGet } from "../actions";

export type InstitutionState = {
  paginatedServices: pot.Pot<
    InstitutionServicesResource,
    WithInstitutionID<NetworkError>
  >;
};

const INITIAL_STATE: InstitutionState = {
  paginatedServices: pot.none
};

const institutionReducer = (
  state: InstitutionState = INITIAL_STATE,
  action: Action
): InstitutionState => {
  switch (action.type) {
    case getType(paginatedServicesGet.request):
      if (action.payload.offset === 0) {
        return {
          ...state,
          paginatedServices: pot.noneLoading
        };
      }

      return {
        ...state,
        paginatedServices: pot.toUpdating(state.paginatedServices, {
          count: 0,
          services: [],
          limit: action.payload.limit,
          offset: action.payload.offset
        })
      };
    case getType(paginatedServicesGet.success):
      if (action.payload.offset === 0) {
        return {
          ...state,
          paginatedServices: pot.some(action.payload)
        };
      }

      const currentServices = pot.getOrElse(
        pot.map(state.paginatedServices, res => res.services),
        []
      );

      return {
        ...state,
        paginatedServices: pot.some({
          ...action.payload,
          services: [...currentServices, ...action.payload.services]
        })
      };
    case getType(paginatedServicesGet.failure):
      return {
        ...state,
        paginatedServices: pot.toError(state.paginatedServices, action.payload)
      };
    case getType(paginatedServicesGet.cancel):
      return {
        ...state,
        paginatedServices: pot.none
      };
  }
  return state;
};

export default institutionReducer;

export const institutionSelector = (state: GlobalState) =>
  state.features.services.institution;

export const paginatedServicesPotSelector = createSelector(
  institutionSelector,
  institution => institution.paginatedServices
);

export const paginatedServicesSelector = createSelector(
  paginatedServicesPotSelector,
  pot.toUndefined
);

export const isLoadingPaginatedServicesSelector = (state: GlobalState) =>
  pipe(state, paginatedServicesPotSelector, pot.isLoading);

export const isUpdatingPaginatedServicesSelector = (state: GlobalState) =>
  pipe(state, paginatedServicesPotSelector, pot.isUpdating);

export const isErrorPaginatedServicesSelector = (state: GlobalState) =>
  pipe(state, paginatedServicesPotSelector, pot.isError);

/**
 * Returns the current page of the paginated services.
 *
 * | count | offset | limit | result |
 * |------:|-------:|------:|-------:|
 * | 55    | 0      | 20    | 0      |
 * | 55    | 20     | 20    | 1      |
 * | 55    | 40     | 20    | 2      |
 * | 55    | 60     | 20    | -1     |
 */
export const paginatedServicesCurrentPageSelector = createSelector(
  paginatedServicesPotSelector,
  paginatedServices =>
    pot.getOrElse(
      pot.map(paginatedServices, ({ count: total, limit, offset }) =>
        offset >= total ? -1 : offset / limit
      ),
      0
    )
);

export const paginatedServicesLastPageSelector = createSelector(
  paginatedServicesPotSelector,
  paginatedServicesCurrentPageSelector,
  (paginatedServices, currentPage) =>
    pot.getOrElse(
      pot.map(
        paginatedServices,
        ({ count: total, limit }) => (currentPage + 1) * limit >= total
      ),
      false
    )
);
