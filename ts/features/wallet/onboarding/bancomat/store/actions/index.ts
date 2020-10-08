import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { AbiResponse } from "../../../../../../../definitions/pagopa/bancomat/AbiResponse";
import { PatchedCard } from "../../../../../bonus/bpd/api/patchedTypes";

/**
 * Request the list of all abi
 */
export const loadAbi = createAsyncAction(
  "WALLET_LOAD_ABI_REQUEST",
  "WALLET_LOAD_ABI_SUCCESS",
  "WALLET_LOAD_ABI_FAILURE"
)<void, AbiResponse, Error>();

/**
 * search for user's pans
 */
export const loadPans = createAsyncAction(
  "WALLET_LOAD_PANS_REQUEST",
  "WALLET_LOAD_PANS_SUCCESS",
  "WALLET_LOAD_PANS_FAILURE"
)<string | undefined, ReadonlyArray<PatchedCard>, Error>();
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

/**
 * The user choose `back` from the first screen
 */
export const walletAddBancomatBack = createStandardAction(
  "WALLET_ADD_BANCOMAT_BACK"
)<void>();

export type AbiActions =
  | ActionType<typeof loadAbi>
  | ActionType<typeof loadPans>
  | ActionType<typeof walletAddBancomatStart>
  | ActionType<typeof walletAddBancomatCompleted>
  | ActionType<typeof walletAddBancomatCancel>
  | ActionType<typeof walletAddBancomatBack>;
