import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../../definitions/content/Service";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";

// TODO: check if response with code !== 200 can mean different errors.
// If false, the failure payload could be just the serviceID as before
export type ContentServiceFailure = {
  error: Error;
  serviceId: string;
};
export const contentServiceLoad = createAsyncAction(
  "CONTENT_SERVICE_LOAD_REQUEST",
  "CONTENT_SERVICE_LOAD_SUCCESS",
  "CONTENT_SERVICE_LOAD_FAILURE"
)<
  ServiceId,
  { serviceId: ServiceId; data: ServiceMetadata },
  ContentServiceFailure
>();

export const contentMunicipalityLoad = createAsyncAction(
  "CONTENT_MUNICIPALITY_LOAD_REQUEST",
  "CONTENT_MUNICIPALITY_LOAD_SUCCESS",
  "CONTENT_MUNICIPALITY_LOAD_FAILURE"
)<
  CodiceCatastale,
  { codiceCatastale: CodiceCatastale; data: MunicipalityMetadata },
  Error
>();

export type ContentActions =
  | ActionType<typeof contentServiceLoad>
  | ActionType<typeof contentMunicipalityLoad>;
