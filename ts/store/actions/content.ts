import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { ServicesByScope } from "../../../definitions/content/ServicesByScope";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { ServiceMetadataState } from "../reducers/content";

// TODO: check if response with code !== 200 can mean different errors.
// If false, the failure payload could be just the serviceID as before
export type ContentServiceFailure = {
  error: Error;
  serviceId: string;
};

export type ContentServiceSuccess = {
  serviceId: string;
  data: ServiceMetadataState;
};

export const contentServiceLoad = createAsyncAction(
  "CONTENT_SERVICE_LOAD_REQUEST",
  "CONTENT_SERVICE_LOAD_SUCCESS",
  "CONTENT_SERVICE_LOAD_FAILURE"
)<ServiceId, ContentServiceSuccess, ContentServiceFailure>();

export const contentMunicipalityLoad = createAsyncAction(
  "CONTENT_MUNICIPALITY_LOAD_REQUEST",
  "CONTENT_MUNICIPALITY_LOAD_SUCCESS",
  "CONTENT_MUNICIPALITY_LOAD_FAILURE"
)<
  CodiceCatastale,
  { codiceCatastale: CodiceCatastale; data: MunicipalityMetadata },
  Error
>();

export const contentServicesByScopeLoad = createAsyncAction(
  "CONTENT_SERVICES_BY_SCOPE_LOAD_REQUEST",
  "CONTENT_SERVICES_BY_SCOPE_LOAD_SUCCESS",
  "CONTENT_SERVICES_BY_SCOPE_LOAD_FAILURE"
)<void, ServicesByScope, Error>();

export type ContentActions =
  | ActionType<typeof contentServiceLoad>
  | ActionType<typeof contentMunicipalityLoad>
  | ActionType<typeof contentServicesByScopeLoad>;
