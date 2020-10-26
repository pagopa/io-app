import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { AbiListResponse } from "../../../../../../../definitions/pagopa/bancomat/AbiListResponse";
import { Card } from "../../../../../../../definitions/pagopa/bancomat/Card";
import { PatchedWalletV2 } from "../../../../../../types/pagopa";
import { LoadPansError } from "../../saga/networking";

/**
 * Request the list of all abi
 */
export const loadAbi = createAsyncAction(
  "WALLET_LOAD_ABI_REQUEST",
  "WALLET_LOAD_ABI_SUCCESS",
  "WALLET_LOAD_ABI_FAILURE"
)<void, AbiListResponse, Error>();

/**
 * search for user's bancomat pans
 */
export const searchUserPans = createAsyncAction(
  "WALLET_ONBOARDING_BANCOMAT_LOAD_PANS_REQUEST",
  "WALLET_ONBOARDING_BANCOMAT_LOAD_PANS_SUCCESS",
  "WALLET_ONBOARDING_BANCOMAT_LOAD_PANS_FAILURE"
)<string | undefined, ReadonlyArray<Card>, LoadPansError>();

/**
 * The user select the current bancomat to add to the wallet
 */
export const addBancomatToWallet = createAsyncAction(
  "WALLET_ONBOARDING_BANCOMAT_ADD_REQUEST",
  "WALLET_ONBOARDING_BANCOMAT_ADD_SUCCESS",
  "WALLET_ONBOARDING_BANCOMAT_ADD_FAILURE"
)<Card, PatchedWalletV2, Error>();

/**
 * The user choose to start the workflow to add a new bancomat to the wallet
 */
export const walletAddBancomatStart = createStandardAction(
  "WALLET_ONBOARDING_BANCOMAT_START"
)<void>();

/**
 * The user complete the workflow to add a new bancomat to the wallet
 * (at least one bancomat has been added)
 */
export const walletAddBancomatCompleted = createStandardAction(
  "WALLET_ONBOARDING_BANCOMAT_COMPLETED"
)<void>();

/**
 * The user choose to cancel the addition of a new bancomat to the wallet (no bancomat has been added)
 */
export const walletAddBancomatCancel = createStandardAction(
  "WALLET_ONBOARDING_BANCOMAT_CANCEL"
)<void>();

/**
 * The user choose `back` from the first screen
 */
export const walletAddBancomatBack = createStandardAction(
  "WALLET_ONBOARDING_BANCOMAT_BACK"
)<void>();

export type AbiActions =
  | ActionType<typeof loadAbi>
  | ActionType<typeof searchUserPans>
  | ActionType<typeof addBancomatToWallet>
  | ActionType<typeof walletAddBancomatStart>
  | ActionType<typeof walletAddBancomatCompleted>
  | ActionType<typeof walletAddBancomatCancel>
  | ActionType<typeof walletAddBancomatBack>;
