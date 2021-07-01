import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { currentSelectedService } from "../../../actions/services";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

export type CurrentServiceSelectedState = {
  serviceID: ServiceId;
} | null;

export const currentServiceSelectedReducer = (
  state: CurrentServiceSelectedState = null,
  action: Action
): CurrentServiceSelectedState => {
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
export const serviceIDCurrentSelector = (
  state: GlobalState
): CurrentServiceSelectedState =>
  state.entities.services.currentSelectedService;
