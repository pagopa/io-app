import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { CgnActivationProgressEnum } from "../reducers/activation";
import { CgnActivationDetail } from "../../../../../../definitions/cgn/CgnActivationDetail";

type ActivationStatus = {
  status: CgnActivationProgressEnum;
  activation?: CgnActivationDetail;
};

export const cgnActivationStart = createStandardAction(
  "CGN_ACTIVATION_START"
)<void>();

/**
 * Completed the activation workflow
 */
export const cgnActivationComplete = createStandardAction(
  "CGN_ACTIVATION_COMPLETED"
)<void>();

/**
 * Cancel the activation workflow
 */
export const cgnActivationCancel = createStandardAction(
  "CGN_ACTIVATION_CANCEL"
)<void>();

/**
 * Fails the activation workflow
 */
export const cgnActivationFailure = createStandardAction(
  "CGN_ACTIVATION_FAILURE"
)<string>();

/**
 * Back from the activation workflow
 */
export const cgnActivationBack = createStandardAction(
  "CGN_ACTIVATION_BACK"
)<void>();

/**
 * get and handle activation state of a CGN
 */
export const cgnActivationStatus = createAsyncAction(
  "CGN_ACTIVATION_STATUS_REQUEST",
  "CGN_ACTIVATION_STATUS_SUCCESS",
  "CGN_ACTIVATION_STATUS_FAILURE"
)<void, ActivationStatus, Error>();

/**
 * get and handle activation request of a CGN
 */
export const cgnRequestActivation = createStandardAction(
  "CGN_REQUEST_ACTIVATION_REQUEST"
)<void>();

export type CgnActivationActions =
  | ActionType<typeof cgnActivationStatus>
  | ActionType<typeof cgnRequestActivation>
  | ActionType<typeof cgnActivationStart>
  | ActionType<typeof cgnActivationComplete>
  | ActionType<typeof cgnActivationCancel>
  | ActionType<typeof cgnActivationFailure>
  | ActionType<typeof cgnActivationBack>;
