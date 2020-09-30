// represent the outcome of iban upsert
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Iban } from "../../../../../../definitions/backend/Iban";
import { IbanStatus } from "../../saga/networking/patchCitizenIban";

/**
 * This file contains all the action related to the iban insertion / change workflow.
 */

export type IbanUpsertResult = { payoffInstr?: Iban; status: IbanStatus };
/**
 * Request the upsert of the citizen iban
 */
export const bpdUpsertIban = createAsyncAction(
  "BPD_UPSERT_IBAN_REQUEST",
  "BPD_UPSERT_IBAN_SUCCESS",
  "BPD_UPSERT_IBAN_FAILURE"
)<Iban, IbanUpsertResult, Error>();

/**
 * Enum used to distinguish between the onboarding workflow that starts from the user onboarding
 * or from the bpd details
 */
export enum IBANInsertionSource {
  ONBOARDING = "ONBOARDING",
  DETAILS = "DETAILS"
}

/**
 * The action that triggers the start of insertion / modification of the IBAN
 */
export const bpdIbanInsertionStart = createStandardAction(
  "BPD_IBAN_INSERTION_START"
)<IBANInsertionSource>();

/**
 * The user choose to go forward and terminate the iban insertion
 */
export const bpdIbanInsertionContinue = createStandardAction(
  "BPD_IBAN_INSERTION_CONTINUE"
)<void>();

/**
 * The user choose to cancel the iban insertion
 */
export const bpdIbanInsertionCancel = createStandardAction(
  "BPD_IBAN_INSERTION_CANCEL"
)<void>();

export type BpdIbanActions =
  | ActionType<typeof bpdUpsertIban>
  | ActionType<typeof bpdIbanInsertionStart>
  | ActionType<typeof bpdIbanInsertionContinue>
  | ActionType<typeof bpdIbanInsertionCancel>;
