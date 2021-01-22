import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { BPay } from "../../../../../../../definitions/pagopa/BPay";
import { RawBPayPaymentMethod } from "../../../../../../types/pagopa";
import { NetworkError } from "../../../../../../utils/errors";

/**
 * Search for user's cobadge cards
 */
export const searchUserCoBadge = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_SEARCH_REQUEST",
  "WALLET_ONBOARDING_COBADGE_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_SEARCH_FAILURE"
)<string | undefined, ReadonlyArray<BPay>, NetworkError>();

/**
 * The user add a specific cobadge card to the wallet
 */
export const addCoBadgeToWallet = createAsyncAction(
  "WALLET_ONBOARDING_COBADGE_ADD_REQUEST",
  "WALLET_ONBOARDING_COBADGE_ADD_SUCCESS",
  "WALLET_ONBOARDING_COBADGE_ADD_FAILURE"
)<BPay, RawBPayPaymentMethod, NetworkError>();

/**
 * The user choose to start the workflow to add a new cobadge to the wallet
 */
export const walletAddCoBadgeStart = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_START"
)<void>();

/**
 * The user complete the workflow to add a new cobadge card to the wallet
 * (at least one cobadge has been added)
 */
export const walletAddCoBadgeCompleted = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_COMPLETED"
)<void>();

/**
 * The user choose to cancel the addition of a cobadge to the wallet (no cobadge has been added)
 */
export const walletAddCoBadgeCancel = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_CANCEL"
)<void>();

/**
 * The user choose `back` from the first screen
 */
export const walletAddCoBadgeBack = createStandardAction(
  "WALLET_ONBOARDING_COBADGE_BACK"
)<void>();

export type CoBadgeActions =
  | ActionType<typeof searchUserCoBadge>
  | ActionType<typeof addCoBadgeToWallet>
  | ActionType<typeof walletAddCoBadgeStart>
  | ActionType<typeof walletAddCoBadgeCompleted>
  | ActionType<typeof walletAddCoBadgeCancel>
  | ActionType<typeof walletAddCoBadgeBack>;
