import { ActionType, createAsyncAction } from "typesafe-actions";
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

export type PayPalOnboardingActions = ActionType<typeof searchPaypalPsp>;
