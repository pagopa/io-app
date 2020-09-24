import { ActionType, createAsyncAction } from "typesafe-actions";
import { CitizenResource } from "../../../../../../definitions/bpd/citizen/CitizenResource";

/**
 * Enroll the user to the bpd program
 */
export const enrollToBpd = createAsyncAction(
  "BDP_ENROLL_REQUEST",
  "BDP_ENROLL_SUCCESS",
  "BDP_ENROLL_FAILURE"
)<void, CitizenResource, Error>();

export type BdpOnboardingActions = ActionType<typeof enrollToBpd>;
