import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { currentSelectedService } from "../../../actions/services";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

export type CurrentServiceSelectedState = {
  serviceID: ServiceId;
};

export const currentServiceSelectedReducer = (
  state: CurrentServiceSelectedState | null = null,
  action: Action
): CurrentServiceSelectedState | null => {
  switch (action.type) {
    case getType(currentSelectedService):
      return {
        serviceID: action.payload
      };
  }
  return state;
};

/**
 * current serviceID selector
 */
export const serviceIDCurrentSelector = createSelector(
  [(state: GlobalState) => state.entities.services.currentSelectedService],
  (serviceID): CurrentServiceSelectedState | null => serviceID
);
