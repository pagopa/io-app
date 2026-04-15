import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { EycaDetail } from "../../reducers/eyca/details";

/**
 * handle the eyca get status request
 */
export const cgnEycaStatus = createAsyncAction(
  "CGN_EYCA_STATUS_REQUEST",
  "CGN_EYCA_STATUS_SUCCESS",
  "CGN_EYCA_STATUS_FAILURE"
)<void, EycaDetail, NetworkError>();

export type CgnEycaStatusActions = ActionType<typeof cgnEycaStatus>;
