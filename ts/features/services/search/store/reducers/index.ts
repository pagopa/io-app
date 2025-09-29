import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Institution } from "../../../../../../definitions/services/Institution";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { searchPaginatedInstitutionsGet } from "../actions";

export type SearchState = {
  paginatedInstitutions: pot.Pot<InstitutionsResource, NetworkError>;
};

const INITIAL_STATE: SearchState = {
  paginatedInstitutions: pot.none
};

const reducer = (
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

export default reducer;
