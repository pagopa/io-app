/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { PaginatedServiceTupleCollection } from "../../../../../definitions/backend/PaginatedServiceTupleCollection";
import { logoutSuccess, sessionExpired } from "../../../actions/authentication";
import { loadVisibleServices } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type VisibleServicesState = pot.Pot<
  PaginatedServiceTupleCollection["items"],
  Error
>;

const INITIAL_STATE: VisibleServicesState = pot.none;

export const visibleServicesReducer = (
  state: VisibleServicesState = INITIAL_STATE,
  action: Action
): VisibleServicesState => {
  switch (action.type) {
    case getType(loadVisibleServices.request):
      return pot.toLoading(state);

    case getType(loadVisibleServices.success):
      return pot.some(action.payload);

    case getType(loadVisibleServices.failure):
      return pot.toError(state, action.payload);

    case getType(logoutSuccess):
    case getType(sessionExpired):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors
export const visibleServicesSelector = (
  state: GlobalState
): VisibleServicesState => state.entities.services.visible;
