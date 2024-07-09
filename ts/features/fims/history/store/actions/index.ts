import { ActionType, createAsyncAction } from "typesafe-actions";
import { ConsentsResponseDTO } from "../../../../../../definitions/fims/ConsentsResponseDTO";

export type FimsHistoryGetPayloadType = {
  isFirstRequest: boolean;
  continuationToken?: string;
};

export const fimsHistoryGet = createAsyncAction(
  "FIMS_GET_HISTORY_REQUEST",
  "FIMS_GET_HISTORY_SUCCESS",
  "FIMS_GET_HISTORY_FAILURE"
)<FimsHistoryGetPayloadType, ConsentsResponseDTO, string>();

export type FimsHistoryActions = ActionType<typeof fimsHistoryGet>;
