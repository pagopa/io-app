import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { AbiResponse } from "../../../../../../../definitions/pagopa/bancomat/AbiResponse";

/**
 * Request the list of all abi
 */
export const loadAbi = createAsyncAction(
  "WALLET_LOAD_ABI_REQUEST",
  "WALLET_LOAD_ABI_SUCCESS",
  "WALLET_LOAD_ABI_FAILURE"
)<void, AbiResponse, Error>();

/**
 * The user choose to start the workflow to add a new bancomat to the wallet
 */
export const walletAddBancomatStart = createStandardAction(
  "WALLET_ADD_BANCOMAT_START"
)<void>();

/**
 * The user complete the workflow to add a new bancomat to the wallet
 * (at least one bancomat has been added)
 */
export const walletAddBancomatCompleted = createStandardAction(
  "WALLET_ADD_BANCOMAT_COMPLETED"
)<void>();

/**
 * The user choose to cancel the addition of a new bancomat to the wallet (no bancomat has been added)
 */
export const walletAddBancomatCancel = createStandardAction(
  "WALLET_ADD_BANCOMAT_CANCEL"
)<void>();

export type AbiActions =
  | ActionType<typeof loadAbi>
  | ActionType<typeof walletAddBancomatStart>
  | ActionType<typeof walletAddBancomatCompleted>
  | ActionType<typeof walletAddBancomatCancel>;
