import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { RawBPayPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";

/**
 * Search for user's BPay accounts
 */
export const searchUserBPay = createAsyncAction(
  "WALLET_ONBOARDING_BPAY_SEARCH_REQUEST",
  "WALLET_ONBOARDING_BPAY_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_BPAY_SEARCH_FAILURE"
)<string | undefined, ReadonlyArray<BPay>, NetworkError>();

/**
 * The user add a specific BPay account to the wallet
 */
export const addBPayToWallet = createAsyncAction(
  "WALLET_ONBOARDING_BPAY_ADD_REQUEST",
  "WALLET_ONBOARDING_BPAY_ADD_SUCCESS",
  "WALLET_ONBOARDING_BPAY_ADD_FAILURE"
)<BPay, RawBPayPaymentMethod, NetworkError>();

/**
 * The user choose to start the workflow to add a new BPay to the wallet
 */
export const walletAddBPayStart = createStandardAction(
  "WALLET_ONBOARDING_BPAY_START"
)<void>();

/**
 * The user complete the workflow to add a new BPay to the wallet
 * (at least one BPay has been added)
 */
export const walletAddBPayCompleted = createStandardAction(
  "WALLET_ONBOARDING_BPAY_COMPLETED"
)<void>();

/**
 * The user choose to cancel the addition of a new BPay to the wallet (no BPay has been added)
 */
export const walletAddBPayCancel = createStandardAction(
  "WALLET_ONBOARDING_BPAY_CANCEL"
)<void>();

/**
 * The workflow fails
 */
export const walletAddBPayFailure = createStandardAction(
  "WALLET_ONBOARDING_BPAY_FAILURE"
)<string>();

/**
 * The user choose `back` from the first screen
 */
export const walletAddBPayBack = createStandardAction(
  "WALLET_ONBOARDING_BPAY_BACK"
)<void>();

export type BPayActions =
  | ActionType<typeof searchUserBPay>
  | ActionType<typeof addBPayToWallet>
  | ActionType<typeof walletAddBPayStart>
  | ActionType<typeof walletAddBPayCompleted>
  | ActionType<typeof walletAddBPayCancel>
  | ActionType<typeof walletAddBPayFailure>
  | ActionType<typeof walletAddBPayBack>;
