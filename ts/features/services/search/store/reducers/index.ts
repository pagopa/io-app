import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Institution } from "../../../../../../definitions/services/Institution";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { searchPaginatedInstitutionsGet } from "../actions";

export type SearchState = {
  paginatedInstitutions: pot.Pot<InstitutionsResource, NetworkError>;
};

const INITIAL_STATE: SearchState = {
  paginatedInstitutions: pot.none
};

const searchReducer = (
  state: SearchState = INITIAL_STATE,
  action: Action
): SearchState => {
  switch (action.type) {
    case getType(searchPaginatedInstitutionsGet.request):
      // when the first page is requested,
      // the state is updated with a noneLoading pot
      if (action.payload.offset === 0) {
        return {
          ...state,
          paginatedInstitutions: pot.noneLoading
        };
      }

      return {
        ...state,
        paginatedInstitutions: pot.toUpdating(state.paginatedInstitutions, {
          count: 0,
          institutions: [],
          ...action.payload
        })
      };
    case getType(searchPaginatedInstitutionsGet.success):
      if (action.payload.offset === 0) {
        return {
          ...state,
          paginatedInstitutions: pot.some(action.payload)
        };
      }

      const currentInstitutions = pot.getOrElse(
        pot.map(
          state.paginatedInstitutions,
          res => res.institutions as Array<Institution>
        ),
        []
      );

      return {
        ...state,
        paginatedInstitutions: pot.some({
          ...action.payload,
          institutions: [...currentInstitutions, ...action.payload.institutions]
        })
      };
    case getType(searchPaginatedInstitutionsGet.failure):
      return {
        ...state,
        paginatedInstitutions: pot.toError(
          state.paginatedInstitutions,
          action.payload
        )
      };
    case getType(searchPaginatedInstitutionsGet.cancel):
      return {
        ...state,
        paginatedInstitutions: pot.none
      };
  }
  return state;
};

export default searchReducer;

export const searchSelector = (state: GlobalState) =>
  state.features.services.search;

export const paginatedInstitutionsPotSelector = createSelector(
  searchSelector,
  search => search.paginatedInstitutions
);

export const paginatedInstitutionsSelector = createSelector(
  paginatedInstitutionsPotSelector,
  pot.toUndefined
);

export const isLoadingPaginatedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, paginatedInstitutionsPotSelector, pot.isLoading);

export const isUpdatingPaginatedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, paginatedInstitutionsPotSelector, pot.isUpdating);

export const isErrorPaginatedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, paginatedInstitutionsPotSelector, pot.isError);

/**
 * Returns the current page of the paginated institutions.
 *
 * | count | offset | limit | result |
 * |------:|-------:|------:|-------:|
 * | 55    | 0      | 20    | 0      |
 * | 55    | 20     | 20    | 1      |
 * | 55    | 40     | 20    | 2      |
 * | 55    | 60     | 20    | -1     |
 */
export const paginatedInstitutionsCurrentPageSelector = createSelector(
  paginatedInstitutionsPotSelector,
  paginatedInstitutions =>
    pot.getOrElse(
      pot.map(paginatedInstitutions, ({ count: total, limit, offset }) =>
        offset >= total ? -1 : offset / limit
      ),
      0
    )
);

export const paginatedInstitutionsLastPageSelector = createSelector(
  paginatedInstitutionsPotSelector,
  paginatedInstitutionsCurrentPageSelector,
  (paginatedInstitutionsPot, currentPage) =>
    pot.getOrElse(
      pot.map(
        paginatedInstitutionsPot,
        ({ count: total, limit }) => (currentPage + 1) * limit >= total
      ),
      false
    )
);
