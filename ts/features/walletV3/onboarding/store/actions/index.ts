import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletCreateResponse } from "../../../../../../definitions/pagopa/walletv3/WalletCreateResponse";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";

export const walletGetPaymentMethods = createAsyncAction(
  "WALLET_GET_PAYMENT_METHODS_REQUEST",
  "WALLET_GET_PAYMENT_METHODS_SUCCESS",
  "WALLET_GET_PAYMENT_METHODS_FAILURE",
  "WALLET_GET_PAYMENT_METHODS_CANCEL"
)<void, PaymentMethodsResponse, NetworkError, void>();

export type WalletOnboardingStartPayload = {
  paymentMethodId: string;
};

export const walletStartOnboarding = createAsyncAction(
  "WALLET_ONBOARDING_START_REQUEST",
  "WALLET_ONBOARDING_START_SUCCESS",
  "WALLET_ONBOARDING_START_FAILURE",
  "WALLET_ONBOARDING_START_CANCEL"
)<WalletOnboardingStartPayload, WalletCreateResponse, NetworkError, void>();

export type WalletOnboardingActions =
  | ActionType<typeof walletStartOnboarding>
  | ActionType<typeof walletGetPaymentMethods>;
