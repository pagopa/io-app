import { ActionType, createAsyncAction } from "typesafe-actions";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ContextualHelp } from "../../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { ServiceMetadataState } from "../reducers/content";
import { Idps } from "../../../definitions/content/Idps";

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

export const loadContextualHelpData = createAsyncAction(
  "LOAD_CONTEXTUAL_HELP_TEXT_DATA_REQUEST",
  "LOAD_CONTEXTUAL_HELP_TEXT_DATA_SUCCESS",
  "LOAD_CONTEXTUAL_HELP_TEXT_DATA_FAILURE"
)<void, ContextualHelp, Error>();

export const loadIdps = createAsyncAction(
  "LOAD_IDPS_REQUEST",
  "LOAD_IDPS_SUCCESS",
  "LOAD_IDPS_FAILURE"
)<void, Idps, Error>();

export type ContentActions =
  | ActionType<typeof loadServiceMetadata>
  | ActionType<typeof contentMunicipalityLoad>
  | ActionType<typeof loadContextualHelpData>
  | ActionType<typeof loadIdps>;
