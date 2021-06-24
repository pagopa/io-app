import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../actions/services/servicePreference";
import { ServicePreferenceResponse } from "../../../../types/services/ServicePreferenceResponse";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { IndexedById } from "../../../helpers/indexer";
import { toError, toLoading, toSome, toUpdating } from "../../IndexedByIdPot";

export type ServicePreferenceState = IndexedById<
  pot.Pot<ServicePreferenceResponse, Error>
>;

const servicePreferenceReducer = (
  state: ServicePreferenceState = {},
  action: Action
): ServicePreferenceState => {
  switch (action.type) {
    case getType(loadServicePreference.request):
      return toLoading(action.payload, state);
    case getType(upsertServicePreference.request):
      return toUpdating(action.payload.id, state, {
        id: action.payload.id,
        kind: "success",
        value: {
          inbox: action.payload.inbox,
          notifications: action.payload.notifications,
          email: action.payload.email,
          version: action.payload.version
        }
      });
    case getType(loadServicePreference.success):
    case getType(upsertServicePreference.success):
      return toSome(action.payload.id, state, action.payload);
    case getType(loadServicePreference.failure):
    case getType(upsertServicePreference.failure):
      return toError(
        action.payload.id,
        state,
        new Error(getNetworkErrorMessage(action.payload))
      );
  }
  return state;
};

export default servicePreferenceReducer;
