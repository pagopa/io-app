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
  "BPD_ENROLL_REQUEST",
  "BPD_ENROLL_SUCCESS",
  "BPD_ENROLL_FAILURE"
)<void, CitizenResource, Error>();

/**
 * Start the onboarding workflow
 */
export const BpdOnboardingStart = createStandardAction("BPD_ONBOARDING_START")<
  void
>();

/**
 * The user choose to activate the bpd
 */
export const BpdUserActivate = createStandardAction(
  "BPD_ONBOARDING_USER_ACTIVATE"
)<void>();

/**
 * Cancel the onboarding workflow
 */
export const BpdOnboardingCancel = createStandardAction(
  "BPD_ONBOARDING_CANCEL"
)<void>();

/**
 * The user accepts and confirms the declaration
 */
export const BpdOnboardingAcceptDeclaration = createStandardAction(
  "BPD_ONBOARDING_ACCEPT_DECLARATION"
)<void>();

export type BpdOnboardingActions =
  | ActionType<typeof enrollToBpd>
  | ActionType<typeof BpdOnboardingStart>
  | ActionType<typeof BpdUserActivate>
  | ActionType<typeof BpdOnboardingAcceptDeclaration>
  | ActionType<typeof BpdOnboardingCancel>;
