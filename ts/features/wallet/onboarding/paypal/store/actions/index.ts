import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { Option } from "fp-ts/lib/Option";
import { NetworkError } from "../../../../../../utils/errors";
import { IOPayPalPsp } from "../../types";
import { PaymentManagerToken } from "../../../../../../types/pagopa";

/**
 * Request the available psp for Paypal
 */
export const searchPaypalPsp = createAsyncAction(
  "WALLET_ONBOARDING_PAYPAL_PSP_SEARCH_REQUEST",
  "WALLET_ONBOARDING_PAYPAL_PSP_SEARCH_SUCCESS",
  "WALLET_ONBOARDING_PAYPAL_PSP_SEARCH_FAILURE"
)<void, ReadonlyArray<IOPayPalPsp>, NetworkError>();

// describes the next step should be done when the onboarding is completed
export type OnOnboardingCompleted = "payment_method_details" | "back";
/**
 * The user chooses to start the workflow to add a new paypal account to the wallet
 */
export const walletAddPaypalStart = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_START"
)<OnOnboardingCompleted>();

export const walletAddPaypalCompleted = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_COMPLETED"
)<void>();

export const walletAddPaypalBack = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_BACK"
)<void>();

export const walletAddPaypalCancel = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_CANCEL"
)<void>();

export const walletAddPaypalFailure = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_FAILURE"
)<void>();

// user selects the psp to handle payments within Paypal
export const walletAddPaypalPspSelected = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_PSP_SELECTED"
)<IOPayPalPsp>();

/**
 * user is going to onboard paypal, a fresh PM token is required
 */
export const walletAddPaypalRefreshPMToken = createAsyncAction(
  "WALLET_ONBOARDING_PAYPAL_REFRESH_PM_TOKEN_REQUEST",
  "WALLET_ONBOARDING_PAYPAL_REFRESH_PM_TOKEN_SUCCESS",
  "WALLET_ONBOARDING_PAYPAL_REFRESH_PM_TOKEN_FAILURE"
)<void, PaymentManagerToken, Error>();

export const walletAddPaypalOutcome = createStandardAction(
  "WALLET_ONBOARDING_PAYPAL_OUTCOME_CODE"
)<Option<string>>();

export type PayPalOnboardingActions =
  | ActionType<typeof searchPaypalPsp>
  | ActionType<typeof walletAddPaypalStart>
  | ActionType<typeof walletAddPaypalCompleted>
  | ActionType<typeof walletAddPaypalBack>
  | ActionType<typeof walletAddPaypalCancel>
  | ActionType<typeof walletAddPaypalFailure>
  | ActionType<typeof walletAddPaypalPspSelected>
  | ActionType<typeof walletAddPaypalRefreshPMToken>
  | ActionType<typeof walletAddPaypalOutcome>;
