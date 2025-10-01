import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { FeaturedServices } from "../../../../../../definitions/services/FeaturedServices";
import { Institution } from "../../../../../../definitions/services/Institution";
import { Institutions } from "../../../../../../definitions/services/Institutions";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  featuredInstitutionsGet,
  featuredServicesGet,
  paginatedInstitutionsGet
} from "../actions";

export type PaginatedInstitutionsError = {
  reason: NetworkError;
  time: Date;
};

export type ServicesHomeState = {
  featuredInstitutions: pot.Pot<Institutions, NetworkError>;
  featuredServices: pot.Pot<FeaturedServices, NetworkError>;
  paginatedInstitutions: pot.Pot<
    InstitutionsResource,
    PaginatedInstitutionsError
  >;
};

const INITIAL_STATE: ServicesHomeState = {
  featuredInstitutions: pot.none,
  featuredServices: pot.none,
  paginatedInstitutions: pot.none
};

const reducer = (
  state: ServicesHomeState = INITIAL_STATE,
  action: Action
): ServicesHomeState => {
  switch (action.type) {
    // Get Institutions actions
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
        paginatedInstitutions: pot.toError(state.paginatedInstitutions, {
          reason: action.payload,
          time: new Date()
        })
      };

    // Get FeaturedInstitutions actions
    case getType(featuredInstitutionsGet.request):
      if (pot.isNone(state.featuredInstitutions)) {
        return {
          ...state,
          featuredInstitutions: pot.noneLoading
        };
      }
      return {
        ...state,
        featuredInstitutions: pot.toUpdating(state.featuredInstitutions, {
          institutions: []
        })
      };
    case getType(featuredInstitutionsGet.success):
      return {
        ...state,
        featuredInstitutions: pot.some(action.payload)
      };
    case getType(featuredInstitutionsGet.failure):
      return {
        ...state,
        featuredInstitutions: pot.toError(
          state.featuredInstitutions,
          action.payload
        )
      };

    // Get FeaturedServices actions
    case getType(featuredServicesGet.request):
      if (pot.isNone(state.featuredServices)) {
        return {
          ...state,
          featuredServices: pot.noneLoading
        };
      }
      return {
        ...state,
        featuredServices: pot.toUpdating(state.featuredServices, {
          services: []
        })
      };
    case getType(featuredServicesGet.success):
      return {
        ...state,
        featuredServices: pot.some(action.payload)
      };
    case getType(featuredServicesGet.failure):
      return {
        ...state,
        featuredServices: pot.toError(state.featuredServices, action.payload)
      };
  }
  return state;
};

export default reducer;
