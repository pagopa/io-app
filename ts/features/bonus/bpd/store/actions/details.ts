import { ActionType, createAsyncAction } from "typesafe-actions";
import { CitizenResource } from "../../../../../../definitions/bpd/citizen/CitizenResource";

/**
 * This file contains all the action related to the bpd details like the activation status, value, etc.
 */

// TODO change payload for loadBpdActivationStatus with this one
export type BpdActivationPayload = {
  enabled: boolean;
  payoffInstr: string | undefined;
};

/**
 * Request the activation status for the user to the bpd program
 */
export const bpdLoadActivationStatus = createAsyncAction(
  "BPD_LOAD_ACTIVATION_STATUS_REQUEST",
  "BPD_LOAD_ACTIVATION_STATUS_SUCCESS",
  "BPD_LOAD_ACTIVATION_STATUS_FAILURE"
)<void, BpdActivationPayload, Error>();

export type BpdDetailsActions = ActionType<typeof bpdLoadActivationStatus>;
