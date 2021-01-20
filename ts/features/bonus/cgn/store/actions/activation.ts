import { ActionType, createAsyncAction } from "typesafe-actions";
import { NullType } from "io-ts";

/**
 * get and handle activation state of a CGN
 */
export const cgnActivationStatus = createAsyncAction(
  "CGN_ACTIVATION_STATUS_REQUEST",
  "CGN_ACTIVATION_STATUS_SUCCESS",
  "CGN_ACTIVATION_STATUS_FAILURE"
)<void, NullType, Error>(); // Replace when API spec is correctly linked and defined

export type CgnActivationActions = ActionType<typeof cgnActivationStatus>;
