import { ActionType, createAsyncAction } from "typesafe-actions";
import { CitizenResource } from "../../../../../../definitions/bdp/citizen/CitizenResource";
/**
 * This file contains all the action related to the bpd details like the activation status, iban, value, etc.
 */

/**
 * Request the activation status for the user to the bdp program
 */
export const loadBdpActivationStatus = createAsyncAction(
  "BDP_LOAD_ACTIVATION_STATUS_REQUEST",
  "BDP_LOAD_ACTIVATION_STATUS_SUCCESS",
  "BDP_LOAD_ACTIVATION_STATUS_FAILURE"
)<void, CitizenResource, Error>();

export type BdpDetailsActions = ActionType<typeof loadBdpActivationStatus>;
