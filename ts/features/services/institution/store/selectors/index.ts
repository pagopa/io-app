import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

export const paginatedServicesPotSelector = (state: GlobalState) =>
  state.features.services.institution.paginatedServices;

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
