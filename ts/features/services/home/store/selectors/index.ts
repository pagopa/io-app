import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

export const paginatedInstitutionsPotSelector = (state: GlobalState) =>
  state.features.services.home.paginatedInstitutions;

export const paginatedInstitutionsSelector = createSelector(
  paginatedInstitutionsPotSelector,
  pot.toUndefined
);

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

export const featuredServicesPotSelector = (state: GlobalState) =>
  state.features.services.home.featuredServices;

export const isLoadingFeaturedServicesSelector = (state: GlobalState) =>
  pipe(
    state,
    featuredServicesPotSelector,
    featuredServicesPot =>
      pot.isLoading(featuredServicesPot) && !pot.isSome(featuredServicesPot)
  );

export const isErrorFeaturedServicesSelector = (state: GlobalState) =>
  pipe(state, featuredServicesPotSelector, pot.isError);

export const featuredServicesSelector = createSelector(
  featuredServicesPotSelector,
  featuredServicesPot =>
    pot.getOrElse(
      pot.map(
        featuredServicesPot,
        featuredServices => featuredServices.services
      ),
      []
    )
);

export const isFeaturedServiceListEmptySelector = (state: GlobalState) =>
  pipe(
    state,
    featuredServicesSelector,
    featuredServices => featuredServices.length === 0
  );

export const shouldRenderFeaturedServiceListSelector = (state: GlobalState) =>
  isLoadingFeaturedServicesSelector(state) ||
  isErrorFeaturedServicesSelector(state) ||
  !isFeaturedServiceListEmptySelector(state);

export const featuredInstitutionsPotSelector = (state: GlobalState) =>
  state.features.services.home.featuredInstitutions;

export const featuredInstitutionsSelector = createSelector(
  featuredInstitutionsPotSelector,
  featuredInstitutionsPot =>
    pot.getOrElse(
      pot.map(
        featuredInstitutionsPot,
        featuredInstitutions => featuredInstitutions.institutions
      ),
      []
    )
);

export const isLoadingFeaturedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, featuredInstitutionsPotSelector, pot.isLoading);

export const isErrorFeaturedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, featuredInstitutionsPotSelector, pot.isError);
