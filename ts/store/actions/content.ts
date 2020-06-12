import { ActionType, createAsyncAction } from "typesafe-actions";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ContextualHelp } from "../../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { ServicesByScope } from "../../../definitions/content/ServicesByScope";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { ServiceMetadataState } from "../reducers/content";

// TODO: check if response with code !== 200 can mean different errors.
// If false, the failure payload could be just the serviceID as before
type ServiceMetadataFailure = {
  error: Error;
  serviceId: string;
};

type MunicipalityFailure = {
  error: Error;
  codiceCatastale: string;
};

type ServiceLetadataSuccess = {
  serviceId: string;
  data: ServiceMetadataState;
};

export const loadServiceMetadata = createAsyncAction(
  "LOAD_SERVICE_METADATA_REQUEST",
  "LOAD_SERVICE_METADATA_SUCCESS",
  "LOAD_SERVICE_METADATA_FAILURE"
)<ServiceId, ServiceLetadataSuccess, ServiceMetadataFailure>();

export const contentMunicipalityLoad = createAsyncAction(
  "CONTENT_MUNICIPALITY_LOAD_REQUEST",
  "CONTENT_MUNICIPALITY_LOAD_SUCCESS",
  "CONTENT_MUNICIPALITY_LOAD_FAILURE"
)<
  CodiceCatastale,
  { codiceCatastale: CodiceCatastale; data: MunicipalityMetadata },
  MunicipalityFailure
>();

export const loadVisibleServicesByScope = createAsyncAction(
  "LOAD_VISIBLE_SERVICES_BY_SCOPE_REQUEST",
  "LOAD_VISIBLE_SERVICES_BY_SCOPE_SUCCESS",
  "LOAD_VISIBLE_SERVICES_BY_SCOPE_FAILURE"
)<void, ServicesByScope, Error>();

export const loadContextualHelpData = createAsyncAction(
  "LOAD_CONTEXTUAL_HELP_TEXT_DATA_REQUEST",
  "LOAD_CONTEXTUAL_HELP_TEXT_DATA_SUCCESS",
  "LOAD_CONTEXTUAL_HELP_TEXT_DATA_FAILURE"
)<void, ContextualHelp, Error>();

export type ContentActions =
  | ActionType<typeof loadServiceMetadata>
  | ActionType<typeof contentMunicipalityLoad>
  | ActionType<typeof loadContextualHelpData>
  | ActionType<typeof loadVisibleServicesByScope>;
