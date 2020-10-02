import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BpdActivationPayload } from "./details";

/**
 * Enroll the user to the bpd program
 */
// TODO: change CitizenResource with boolean?
export const bpdEnrollUserToProgram = createAsyncAction(
  "BPD_ENROLL_REQUEST",
  "BPD_ENROLL_SUCCESS",
  "BPD_ENROLL_FAILURE"
)<void, BpdActivationPayload, Error>();

/**
 * Start the onboarding workflow
 */
export const bpdOnboardingStart = createStandardAction("BPD_ONBOARDING_START")<
  void
>();

/**
 * The user choose to activate the bpd
 */
export const bpdUserActivate = createStandardAction(
  "BPD_ONBOARDING_USER_ACTIVATE"
)<void>();

/**
 * Cancel the onboarding workflow
 */
export const bpdOnboardingCancel = createStandardAction(
  "BPD_ONBOARDING_CANCEL"
)<void>();

/**
 * The user accepts and confirms the declaration
 */
export const bpdOnboardingAcceptDeclaration = createStandardAction(
  "BPD_ONBOARDING_ACCEPT_DECLARATION"
)<void>();

export type BpdOnboardingActions =
  | ActionType<typeof bpdEnrollUserToProgram>
  | ActionType<typeof bpdOnboardingStart>
  | ActionType<typeof bpdUserActivate>
  | ActionType<typeof bpdOnboardingAcceptDeclaration>
  | ActionType<typeof bpdOnboardingCancel>;
