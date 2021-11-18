import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { IOPayPalPsp } from "../../types";

/**
 * Request the available psp for Paypal
 */
export const searchPaypalPsp = createAsyncAction(
  "WALLET_ONBOARDING_PAYPAL_PSP_SEARCH_REQUEST",
  "WALLET_ONBOARDING_PAYPAL_PSP_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_PAYPAL_PSP_SEARCH_FAILURE"
)<void, ReadonlyArray<IOPayPalPsp>, NetworkError>();

/**
 * The user choose to start the workflow to add a new paypal account to the wallet
 */
export const walletAddPaypalStart = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_START"
)<void>();

export type PayPalOnboardingActions =
  | ActionType<typeof searchPaypalPsp>
  | ActionType<typeof walletAddPaypalStart>;
