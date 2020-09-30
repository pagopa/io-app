import { ActionType, createAsyncAction } from "typesafe-actions";
import { Iban } from "../../../../../../definitions/backend/Iban";
import { IbanStatus } from "../../saga/networking/patchCitizenIban";

/**
 * This file contains all the action related to the bpd details like the activation status, iban, value, etc.
 */

// TODO change payload for loadBpdActivationStatus with this one
export type BpdActivationPayload = {
  enabled: boolean;
  payoffInstr: string | undefined;
};

/**
 * Request the activation status for the user to the bpd program
 */
export const bpdLoadActivationStatus = createAsyncAction(
  "BPD_LOAD_ACTIVATION_STATUS_REQUEST",
  "BPD_LOAD_ACTIVATION_STATUS_SUCCESS",
  "BPD_LOAD_ACTIVATION_STATUS_FAILURE"
)<void, BpdActivationPayload, Error>();

// represent the outcome of iban upsert
export type IbanUpsertResult = { payoffInstr?: Iban; status: IbanStatus };
/**
 * Request the upsert of the citizen iban
 */
export const bpdUpsertIban = createAsyncAction(
  "BPD_UPSERT_IBAN_REQUEST",
  "BPD_UPSERT_IBAN_SUCCESS",
  "BPD_UPSERT_IBAN_FAILURE"
)<Iban, IbanUpsertResult, Error>();

export type BpdDetailsActions =
  | ActionType<typeof bpdLoadActivationStatus>
  | ActionType<typeof bpdUpsertIban>;
