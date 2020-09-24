import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { CitizenResource } from "../../../../../../definitions/bpd/citizen/CitizenResource";

/**
 * Enroll the user to the bpd program
 */
export const enrollToBpd = createAsyncAction(
  "BDP_ENROLL_REQUEST",
  "BDP_ENROLL_SUCCESS",
  "BDP_ENROLL_FAILURE"
)<void, CitizenResource, Error>();

/**
 * Start the onboarding workflow
 */
export const BpdOnboardingStart = createStandardAction("BDP_ONBOARDING_START")<
  void
>();

/**
 * The user choose to activate the bpd
 */
export const BpdUserActivate = createStandardAction(
  "BDP_ONBOARDING_USER_ACTIVATE"
)<void>();

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
  | ActionType<typeof BpdUserActivate>
  | ActionType<typeof BpdOnboardingAcceptDeclaration>
  | ActionType<typeof BpdOnboardingCancel>;
