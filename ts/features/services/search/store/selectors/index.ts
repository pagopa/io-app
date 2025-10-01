import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

export const paginatedInstitutionsPotSelector = (state: GlobalState) =>
  state.features.services.search.paginatedInstitutions;

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
