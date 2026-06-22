import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { CgnEycaActivationStatus } from "../../reducers/eyca/activation";

/**
 * Cancel the activation workflow
 */
export const cgnEycaActivationCancel = createStandardAction(
  "CGN_EYCA_ACTIVATION_CANCEL"
)<void>();

/**
 * Action to handle EYCA Activation Status
 */
export const cgnEycaActivation = createAsyncAction(
  "CGN_EYCA_ACTIVATION_REQUEST",
  "CGN_EYCA_ACTIVATION_SUCCESS",
  "CGN_EYCA_ACTIVATION_FAILURE"
)<void, CgnEycaActivationStatus, NetworkError>();

/**
 * Action to request the EYCA Activation Status of the orchestrator
 */
export const cgnEycaActivationStatusRequest = createStandardAction(
  "CGN_EYCA_ACTIVATION_STATUS_REQUEST"
)<void>();

export type CgnEycaActivationActions =
  | ActionType<typeof cgnEycaActivation>
  | ActionType<typeof cgnEycaActivationCancel>
  | ActionType<typeof cgnEycaActivationStatusRequest>;
