import { ActionType, createAsyncAction } from "typesafe-actions";

/**
 * Enroll the user to the bpd program
 */
export const enrollToBpd = createAsyncAction(
  "BDP_ENROLL_REQUEST",
  "BDP_ENROLL_SUCCESS",
  "BDP_ENROLL_FAILURE"
)<void, boolean, Error>();

export type BdpOnboardingActions = ActionType<typeof enrollToBpd>;
