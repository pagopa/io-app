import { ActionType, createAsyncAction } from "typesafe-actions";
import { ConsentsResponseDTO } from "../../../../../../definitions/fims/ConsentsResponseDTO";
import { FimsExportSuccessStates } from "../reducer";

export type FimsHistoryGetPayloadType = {
  shouldReloadFromScratch?: boolean;
  continuationToken?: string;
};

export const fimsHistoryGet = createAsyncAction(
  "FIMS_GET_HISTORY_REQUEST",
  "FIMS_GET_HISTORY_SUCCESS",
  "FIMS_GET_HISTORY_FAILURE"
)<FimsHistoryGetPayloadType, ConsentsResponseDTO, string>();

export const fimsHistoryExport = createAsyncAction(
  "FIMS_HISTORY_EXPORT_REQUEST",
  "FIMS_HISTORY_EXPORT_SUCCESS",
  "FIMS_HISTORY_EXPORT_FAILURE"
)<void, FimsExportSuccessStates, void>();

export type FimsHistoryActions =
  | ActionType<typeof fimsHistoryGet>
  | ActionType<typeof fimsHistoryExport>;
