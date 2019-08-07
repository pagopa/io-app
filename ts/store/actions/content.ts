import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { Service as ServiceMetadata } from "../../../definitions/content/Service";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";

export const contentServiceLoad = createAsyncAction(
  "CONTENT_SERVICE_LOAD_REQUEST",
  "CONTENT_SERVICE_LOAD_SUCCESS",
  "CONTENT_SERVICE_LOAD_FAILURE"
)<ServiceId, { serviceId: ServiceId; data: ServiceMetadata }, ServiceId>();

export const contentMunicipalityLoad = createAsyncAction(
  "CONTENT_MUNICIPALITY_LOAD_REQUEST",
  "CONTENT_MUNICIPALITY_LOAD_SUCCESS",
  "CONTENT_MUNICIPALITY_LOAD_FAILURE"
)<
  CodiceCatastale,
  { codiceCatastale: CodiceCatastale; data: MunicipalityMetadata },
  CodiceCatastale
>();

export type ContentActions =
  | ActionType<typeof contentServiceLoad>
  | ActionType<typeof contentMunicipalityLoad>;
