import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../actions/types";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../../actions/services/servicePreference";
import { ServicePreferenceResponse } from "../../../../types/services/ServicePreferenceResponse";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { IndexedById } from "../../../helpers/indexer";
import { toError, toLoading, toSome, toUpdating } from "../../IndexedByIdPot";
import { GlobalState } from "../../types";

export type ServicePreferenceState = IndexedById<
  pot.Pot<ServicePreferenceResponse, Error>
>;

// Reducer to handle specific service contact preferences (inbox, push, emails)
const servicePreferenceReducer = (
  state: ServicePreferenceState = {},
  action: Action
): ServicePreferenceState => {
  switch (action.type) {
    case getType(loadServicePreference.request):
      return toLoading(action.payload, state);
    case getType(upsertServicePreference.request):
      const { id, ...payload } = action.payload;

      return toUpdating(id, state, {
        id,
        kind: "success",
        value: payload
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

export const servicePreferenceSelector = (
  state: GlobalState
): ServicePreferenceState => state.entities.services.servicePreference;

export const servicePreferenceByIDSelector = (id: string) =>
  createSelector(
    servicePreferenceSelector,
    (spById): pot.Pot<ServicePreferenceResponse, Error> =>
      spById[id] ?? pot.none
  );
