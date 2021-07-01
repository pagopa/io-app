import { createAsyncAction } from "typesafe-actions";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../../types/services/ServicePreferenceResponse";
import { NetworkError } from "../../../utils/errors";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { EnabledChannels } from "../../../utils/profile";

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
  WithServiceID<EnabledChannels>,
  ServicePreferenceResponse,
  WithServiceID<NetworkError>
>();
