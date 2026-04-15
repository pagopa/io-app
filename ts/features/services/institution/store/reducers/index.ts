import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
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

const reducer = (
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

export default reducer;
