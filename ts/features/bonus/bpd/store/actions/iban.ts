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
 * The action that triggers the start of insertion / modification of the IBAN
 */
export const bpdIbanInsertionStart = createStandardAction(
  "BPD_IBAN_INSERTION_START"
)<void>();

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

export const bpdIbanInsertionResetScreen = createStandardAction(
  "BPD_IBAN_INSERTION_RESET_SCREEN"
)<void>();

export type BpdIbanActions =
  | ActionType<typeof bpdUpsertIban>
  | ActionType<typeof bpdIbanInsertionStart>
  | ActionType<typeof bpdIbanInsertionContinue>
  | ActionType<typeof bpdIbanInsertionCancel>
  | ActionType<typeof bpdIbanInsertionResetScreen>;
