import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../actions/services/servicePreference";
import { ServicePreferenceResponse } from "../../../../types/services/ServicePreferenceResponse";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { GlobalState } from "../../types";

export type ServicePreferenceState = pot.Pot<ServicePreferenceResponse, Error>;

// Reducer to handle specific service contact preferences (inbox, push, emails)
const servicePreferenceReducer = (
  state: ServicePreferenceState = pot.none,
  action: Action
): ServicePreferenceState => {
  switch (action.type) {
    case getType(loadServicePreference.request):
      return pot.toLoading(state);
    case getType(upsertServicePreference.request):
      const { id, ...payload } = action.payload;

      return pot.toUpdating(state, {
        id,
        kind: "success",
        value: payload
      });
    case getType(loadServicePreference.success):
    case getType(upsertServicePreference.success):
      return pot.some(action.payload);
    case getType(loadServicePreference.failure):
    case getType(upsertServicePreference.failure):
      return pot.toError(
        state,
        new Error(getNetworkErrorMessage(action.payload))
      );
  }
  return state;
};

export default servicePreferenceReducer;

// Selectors
export const servicePreferenceSelector = (
  state: GlobalState
): ServicePreferenceState => state.entities.services.servicePreference;
