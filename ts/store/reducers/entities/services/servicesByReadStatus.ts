import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { clearCache } from "../../../actions/profile";
import { showServiceDetails } from "../../../actions/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";

export type ServicesByReadState = Readonly<{
  [key: string]: pot.Pot<ServicePublic, Error> | undefined;
}>;

const INITIAL_STATE: ServicesByReadState = {};

export const serviceReadByIdSelector = (
  state: GlobalState,
  id: string
): pot.Pot<ServicePublic, Error> | undefined =>
  state.entities.services.readState[id];

export const readServicesSelector = (state: GlobalState): ServicesByReadState =>
  state.entities.services.readState;

export function serviceByReadStateReducer(
  state = INITIAL_STATE,
  action: Action
): ServicesByReadState {
  switch (action.type) {
    case getType(showServiceDetails):
      // add the service to the read list
      return {
        ...state,
        [action.payload.service_id]: pot.some(action.payload)
      };
    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default serviceByReadStateReducer;
