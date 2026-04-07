import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { NetworkError } from "../../../../../utils/errors";
import {
  ServicePreference,
  ServicePreferenceResponse,
  WithServiceID
} from "../../types/ServicePreferenceResponse";

/**
 * Actions to load the specified preferences for a given ServiceID
 */
export const loadServicePreference = createAsyncAction(
  "SERVICE_PREFERENCE_REQUEST",
  "SERVICE_PREFERENCE_SUCCESS",
  "SERVICE_PREFERENCE_FAILURE"
)<ServiceId, ServicePreferenceResponse, WithServiceID<NetworkError>>();

/**
 * Actions to request the update of the specified preferences for a given ServiceID
 */
export const upsertServicePreference = createAsyncAction(
  "SERVICE_PREFERENCE_UPSERT_REQUEST",
  "SERVICE_PREFERENCE_UPSERT_SUCCESS",
  "SERVICE_PREFERENCE_UPSERT_FAILURE"
)<
  WithServiceID<ServicePreference>,
  ServicePreferenceResponse,
  WithServiceID<NetworkError>
>();

export type ServicePreferenceActions =
  | ActionType<typeof loadServicePreference>
  | ActionType<typeof upsertServicePreference>;
