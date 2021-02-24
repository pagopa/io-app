import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { EycaActivationDetail } from "../../../../../../../definitions/cgn/EycaActivationDetail";
import { CgnEycaActivationProgressEnum } from "../../reducers/eyca/activation";

type EycaActivationStatus = {
  status: CgnEycaActivationProgressEnum;
  value: EycaActivationDetail;
};

/**
 * Action to handle EYCA Activation Request
 */
export const cgnEycaActivationRequest = createStandardAction(
  "CGN_EYCA_ACTIVATION_REQUEST"
)<void>();

/**
 * Action to handle EYCA Activation Status
 */
export const cgnEycaActivationStatus = createAsyncAction(
  "CGN_EYCA_ACTIVATION_STATUS_REQUEST",
  "CGN_EYCA_ACTIVATION_STATUS_SUCCESS",
  "CGN_EYCA_ACTIVATION__STATUS_FAILURE"
)<void, EycaActivationStatus, NetworkError>();

export type CgnEycaActivationActions =
  | ActionType<typeof cgnEycaActivationRequest>
  | ActionType<typeof cgnEycaActivationStatus>;
