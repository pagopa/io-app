/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { ServiceList } from "../../../../../definitions/backend/ServiceList";
import { clearCache } from "../../../actions/profile";
import {
  loadVisibleServicesFailure,
  loadVisibleServicesRequest,
  loadVisibleServicesSuccess
} from "../../../actions/services";
import { Action } from "../../../actions/types";

export type VisibleServicesState = pot.Pot<ServiceList["items"], Error>;

const INITIAL_STATE: VisibleServicesState = pot.none;

export const visibleServicesReducer = (
  state: VisibleServicesState = INITIAL_STATE,
  action: Action
): VisibleServicesState => {
  switch (action.type) {
    case getType(loadVisibleServicesRequest):
      return pot.toLoading(state);

    case getType(loadVisibleServicesSuccess):
      return pot.some(action.payload);

    case getType(loadVisibleServicesFailure):
      return pot.toError(state, Error());

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};
