import { ActionType, createAsyncAction } from "typesafe-actions";
import { CitizenResource } from "../../../../../../definitions/bpd/citizen/CitizenResource";
/**
 * This file contains all the action related to the bpd details like the activation status, iban, value, etc.
 */

/**
 * Request the activation status for the user to the bpd program
 */
export const loadBpdActivationStatus = createAsyncAction(
  "BPD_LOAD_ACTIVATION_STATUS_REQUEST",
  "BPD_LOAD_ACTIVATION_STATUS_SUCCESS",
  "BPD_LOAD_ACTIVATION_STATUS_FAILURE"
)<void, CitizenResource, Error>();

export type BpdDetailsActions = ActionType<typeof loadBpdActivationStatus>;
