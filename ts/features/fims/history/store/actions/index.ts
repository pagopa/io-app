import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { AccessHistoryPage } from "../../../../../../definitions/fims_history/AccessHistoryPage";
import { FimsExportSuccessStates } from "../reducer";

export type FimsHistoryGetPayloadType = {
  shouldReloadFromScratch?: boolean;
  continuationToken?: string;
};

export const fimsHistoryGet = createAsyncAction(
  "FIMS_GET_HISTORY_REQUEST",
  "FIMS_GET_HISTORY_SUCCESS",
  "FIMS_GET_HISTORY_FAILURE"
)<FimsHistoryGetPayloadType, AccessHistoryPage, string>();

export const fimsHistoryExport = createAsyncAction(
  "FIMS_HISTORY_EXPORT_REQUEST",
  "FIMS_HISTORY_EXPORT_SUCCESS",
  "FIMS_HISTORY_EXPORT_FAILURE"
)<void, FimsExportSuccessStates, void>();

export const resetFimsHistoryState = createStandardAction(
  "RESET_FIMS_HISTORY_STATE"
)<void>();

export const resetFimsHistoryExportState =
  createStandardAction("RESET_FIMS_HISTORY")<void>();

export type FimsHistoryActions =
  | ActionType<typeof fimsHistoryGet>
  | ActionType<typeof fimsHistoryExport>
  | ActionType<typeof resetFimsHistoryExportState>
  | ActionType<typeof resetFimsHistoryState>;
