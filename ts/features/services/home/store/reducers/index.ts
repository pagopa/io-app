import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Institution } from "../../../../../../definitions/services/Institution";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { paginatedInstitutionsGet } from "../actions";

export type ServicesHomeState = {
  paginatedInstitutions: pot.Pot<InstitutionsResource, NetworkError>;
};

const INITIAL_STATE: ServicesHomeState = {
  paginatedInstitutions: pot.none
};

const homeReducer = (
  state: ServicesHomeState = INITIAL_STATE,
  action: Action
): ServicesHomeState => {
  switch (action.type) {
    case getType(paginatedInstitutionsGet.request):
      if (pot.isNone(state.paginatedInstitutions)) {
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
    case getType(paginatedInstitutionsGet.success):
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
    case getType(paginatedInstitutionsGet.failure):
      return {
        ...state,
        paginatedInstitutions: pot.toError(
          state.paginatedInstitutions,
          action.payload
        )
      };
  }
  return state;
};

export default homeReducer;

export const homeSelector = (state: GlobalState) =>
  state.features.services.home;

export const paginatedInstitutionsPotSelector = createSelector(
  homeSelector,
  home => home.paginatedInstitutions
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
