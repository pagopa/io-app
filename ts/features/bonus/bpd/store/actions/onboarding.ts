import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

/**
 * Enroll the user to the bpd program
 */
export const enrollToBpd = createAsyncAction(
  "BDP_ENROLL_REQUEST",
  "BDP_ENROLL_SUCCESS",
  "BDP_ENROLL_FAILURE"
)<void, boolean, Error>();

/**
 * Start the onboarding workflow
 */
export const BpdOnboardingStart = createStandardAction("BDP_ONBOARDING_START")<
  void
>();

/**
 * Cancel the onboarding workflow
 */
export const BpdOnboardingCancel = createStandardAction(
  "BDP_ONBOARDING_CANCEL"
)<void>();

/**
 * The user accepts and confirms the declaration
 */
export const BpdOnboardingAcceptDeclaration = createStandardAction(
  "BDP_ONBOARDING_ACCEPT_DECLARATION"
)<void>();

export type BdpOnboardingActions =
  | ActionType<typeof enrollToBpd>
  | ActionType<typeof BpdOnboardingStart>
  | ActionType<typeof BpdOnboardingCancel>;
