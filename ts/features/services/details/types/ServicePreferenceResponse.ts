import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { EnabledChannels } from "../../../../utils/profile";

export type ServicePreference = EnabledChannels & { settings_version: number };

/**
 * Type representing all handled responses from backend
 */
export type ServicePreferenceResponse = WithServiceID<
  ServicePreferenceResponseFailure | ServicePreferenceResponseSuccess
>;

/**
 * Type representing all failures provided by API responses
 */
export type ServicePreferenceResponseFailure =
  | ServicePreferenceConflict
  | ServicePreferenceNotFound
  | ServicePreferenceTooManyRequests;

/**
 * Bind the response with the id of the service
 */
export type WithServiceID<T> = T & {
  id: ServiceId;
};

/**
 * The Service Preference has a different version on remote (409)
 */
type ServicePreferenceConflict = {
  kind: "conflictingVersion";
};

/**
 * The required service is not found (404)
 */
type ServicePreferenceNotFound = {
  kind: "notFound";
};

/**
 * Type representing service preference successfully loaded
 */
type ServicePreferenceResponseSuccess = {
  kind: "success";
  value: ServicePreference;
};

/**
 * Too many requests has been sent for the Service Preference (429)
 */
type ServicePreferenceTooManyRequests = {
  kind: "tooManyRequests";
};

export const isServicePreferenceResponseSuccess = (
  sp: ServicePreferenceResponse
): sp is WithServiceID<ServicePreferenceResponseSuccess> =>
  sp.kind === "success";
