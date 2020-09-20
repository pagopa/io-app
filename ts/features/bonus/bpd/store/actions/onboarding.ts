import { ActionType, createAsyncAction } from "typesafe-actions";

/**
 * Check if the user is eligible for the bpd program
 */
export const checkBdpEligibility = createAsyncAction(
  "BDP_CHECK_ELIGIBILITY_REQUEST",
  "BDP_CHECK_ELIGIBILITY_SUCCESS",
  "BDP_CHECK_ELIGIBILITY_FAILURE"
)<void, boolean, Error>();

/**
 * Enroll the user to the bpd program
 */
export const enrollToBpd = createAsyncAction(
  "BDP_ENROLL_REQUEST",
  "BDP_ENROLL_SUCCESS",
  "BDP_ENROLL_FAILURE"
)<void, boolean, Error>();

export type BdpOnboardingActions =
  | ActionType<typeof checkBdpEligibility>
  | ActionType<typeof enrollToBpd>;
