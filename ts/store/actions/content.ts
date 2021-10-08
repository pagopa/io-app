import { ActionType, createAsyncAction } from "typesafe-actions";
import { ContextualHelp } from "../../../definitions/content/ContextualHelp";
import { Municipality as MunicipalityMetadata } from "../../../definitions/content/Municipality";
import { CodiceCatastale } from "../../types/MunicipalityCodiceCatastale";
import { SpidIdps } from "../../../definitions/content/SpidIdps";

type MunicipalityFailure = {
  error: Error;
  codiceCatastale: string;
};

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
)<void, SpidIdps, Error>();

export type ContentActions =
  | ActionType<typeof contentMunicipalityLoad>
  | ActionType<typeof loadContextualHelpData>
  | ActionType<typeof loadIdps>;
