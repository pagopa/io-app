import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NullType } from "io-ts";

export const cgnActivationStart = createStandardAction("CGN_ACTIVATION_START")<
  void
>();

/**
 * Cancel the activation workflow
 */
export const cgnActivationCancel = createStandardAction(
  "CGN_ACTIVATION_CANCEL"
)<void>();

/**
 * get and handle activation state of a CGN
 */
export const cgnActivationStatus = createAsyncAction(
  "CGN_ACTIVATION_STATUS_REQUEST",
  "CGN_ACTIVATION_STATUS_SUCCESS",
  "CGN_ACTIVATION_STATUS_FAILURE"
)<void, NullType, Error>(); // Replace when API spec is correctly linked and defined

export type CgnActivationActions =
  | ActionType<typeof cgnActivationStatus>
  | ActionType<typeof cgnActivationStart>
  | ActionType<typeof cgnActivationCancel>;
