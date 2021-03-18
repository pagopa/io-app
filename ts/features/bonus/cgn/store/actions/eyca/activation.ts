import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { CgnEycaActivationStatus } from "../../reducers/eyca/activation";

/**
 * Action to handle EYCA Activation Status
 */
export const cgnEycaActivation = createAsyncAction(
  "CGN_EYCA_ACTIVATION_REQUEST",
  "CGN_EYCA_ACTIVATION_SUCCESS",
  "CGN_EYCA_ACTIVATION_FAILURE"
)<void, CgnEycaActivationStatus, NetworkError>();

export type CgnEycaActivationActions = ActionType<typeof cgnEycaActivation>;
