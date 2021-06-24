import { ServiceID, ServicePreference } from "./ServicePreference";

/**
 * Type representing success case by API responses
 */
type ServicePreferenceResponseSuccess = {
  kind: "success";
  value: ServicePreference;
};

/**
 * The required service is not found (404)
 */
type ServicePreferenceNotFound = {
  kind: "notFound";
};

/**
 * The Service Preference has a different version on remote (409)
 */
type ServicePreferenceConflict = {
  kind: "conflictingVersion";
};

/**
 * Too many requests has been sent for the Service Preference (429)
 */
type ServicePreferenceTooManyRequests = {
  kind: "tooManyRequests";
};

/**
 * Type representing all failures provided by API responses
 */
type ServicePreferenceResponseFailure =
  | ServicePreferenceNotFound
  | ServicePreferenceConflict
  | ServicePreferenceTooManyRequests;

/**
 * Bind the response with the id of the service
 */
export type WithServiceID<T> = T & {
  id: ServiceID;
};

/**
 * Type representing all handled responses from backend
 */
export type ServicePreferenceResponse = WithServiceID<
  ServicePreferenceResponseSuccess | ServicePreferenceResponseFailure
>;

export const isServicePreferenceResponseSuccess = (
  sp: ServicePreferenceResponse
): sp is WithServiceID<ServicePreferenceResponseSuccess> =>
  sp.kind === "success";
